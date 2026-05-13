import type { CommitMessage, Config, RunList } from './types';
import { info, setOutput } from '@actions/core';
import { useCheckForTag } from './commit';

export function applyEnvironmentMappings(
  commitMessage: CommitMessage,
  config: Config,
  needsToRun: RunList,
): void {
  const checkForTag = useCheckForTag(commitMessage);
  for (const group of config.groups) {
    if (!needsToRun[group.name])
      continue;
    for (const mapping of group.environments) {
      if (checkForTag(mapping.tag)) {
        const outputName = `${group.name}_environment`;
        setOutput(outputName, mapping.value);
        info(`[${mapping.tag}] => ${outputName}=${mapping.value}`);
        break;
      }
    }
  }
}
