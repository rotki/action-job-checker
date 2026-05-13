import type { IActionInputs } from './input';
import type { GroupConfig, RunList } from './types';
import { info } from '@actions/core';
import { changeDetected, checkForChanges } from './changes';
import { useCheckForTag } from './commit';
import { hasLabel, isLabelEvent, isSkipLabelChanged } from './labels';
import { Tag } from './tags';

function initRunList(groups: GroupConfig[]): RunList {
  const list: RunList = {};
  for (const group of groups)
    list[group.name] = false;
  return list;
}

function applyImplications(groups: GroupConfig[], runList: RunList): void {
  const byName = new Map(groups.map(g => [g.name, g]));
  let changed = true;
  while (changed) {
    changed = false;
    for (const group of groups) {
      if (!runList[group.name])
        continue;
      for (const target of group.implies) {
        if (!runList[target] && byName.has(target)) {
          runList[target] = true;
          changed = true;
        }
      }
    }
  }
}

function applyRunTags(
  groups: GroupConfig[],
  needsToRun: RunList,
  checkForTag: (tag: string) => boolean,
): void {
  for (const group of groups) {
    if (group.runTag && checkForTag(group.runTag)) {
      info(`[${group.runTag}] detected, running group "${group.name}"`);
      needsToRun[group.name] = true;
    }
  }
}

function applySkipTags(
  groups: GroupConfig[],
  needsToRun: RunList,
  checkForTag: (tag: string) => boolean,
): void {
  for (const group of groups) {
    if (group.skipTag && checkForTag(group.skipTag) && needsToRun[group.name]) {
      info(`[${group.skipTag}] detected, skipping group "${group.name}"`);
      needsToRun[group.name] = false;
    }
  }
}

async function detectFromChanges(groups: GroupConfig[], needsToRun: RunList): Promise<void> {
  await checkForChanges((files) => {
    if (files === null) {
      for (const group of groups)
        needsToRun[group.name] = true;
      return;
    }
    info(`Checking ${files.length} files of the PR for changes`);
    for (const group of groups) {
      if (group.paths.length > 0 && changeDetected(group.paths, files))
        needsToRun[group.name] = true;
    }
  });
}

export async function checkRequiredTasks(
  commitMessage: string | null,
  inputs: IActionInputs,
): Promise<RunList> {
  const { groups } = inputs.config;
  const needsToRun = initRunList(groups);

  if (isLabelEvent() && !isSkipLabelChanged(inputs.skipLabel)) {
    info('Label changed but not the skip label, skipping all tasks');
    return needsToRun;
  }

  if (await hasLabel(inputs.skipLabel)) {
    info(`PR has label "${inputs.skipLabel}", skipping all tasks`);
    return needsToRun;
  }

  const checkForTag = useCheckForTag(commitMessage);

  if (checkForTag(Tag.SKIP_CI) || checkForTag(Tag.CI_SKIP)) {
    info(`[${Tag.SKIP_CI}] or [${Tag.CI_SKIP}] detected, skipping all tasks`);
    return needsToRun;
  }

  if (checkForTag(Tag.RUN_ALL)) {
    for (const group of groups)
      needsToRun[group.name] = true;
    info(`[${Tag.RUN_ALL}] detected, running all tasks`);
  }
  else if (groups.some(g => g.runTag && checkForTag(g.runTag))) {
    applyRunTags(groups, needsToRun, checkForTag);
  }
  else {
    await detectFromChanges(groups, needsToRun);
  }

  applyImplications(groups, needsToRun);
  applySkipTags(groups, needsToRun, checkForTag);

  return needsToRun;
}
