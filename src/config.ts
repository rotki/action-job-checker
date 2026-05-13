import type { Config, EnvironmentMapping, GroupConfig } from './types';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Ajv, { type ErrorObject } from 'ajv';
import { load } from 'js-yaml';

const schemaPath = resolve(import.meta.dirname, '../schema.json');
const schema: object = JSON.parse(readFileSync(schemaPath, 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile<{ groups: RawGroup[] }>(schema);

function formatErrors(errors: ErrorObject[]): string {
  return errors
    .map((err) => {
      const where = err.instancePath || '(root)';
      const params = Object.entries(err.params)
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(', ');
      return `  ${where} ${err.message}${params ? ` (${params})` : ''}`;
    })
    .join('\n');
}

interface RawGroup {
  name: string;
  paths?: string[];
  run_tag?: string;
  skip_tag?: string;
  implies?: string[];
  environments?: EnvironmentMapping[];
}

function toGroupConfig(raw: RawGroup): GroupConfig {
  return {
    environments: raw.environments ?? [],
    implies: raw.implies ?? [],
    name: raw.name,
    paths: (raw.paths ?? []).map(p => p.trim()).filter(p => p !== ''),
    runTag: raw.run_tag?.trim() || undefined,
    skipTag: raw.skip_tag?.trim() || undefined,
  };
}

export function parseConfig(source: string): Config {
  const parsed = load(source);

  if (!validate(parsed)) {
    throw new Error(
      `Invalid config:\n${formatErrors(validate.errors ?? [])}`,
    );
  }

  const groups = parsed.groups.map(toGroupConfig);

  const names = new Set<string>();
  for (const group of groups) {
    if (names.has(group.name))
      throw new Error(`duplicate group name: ${group.name}`);
    names.add(group.name);
  }

  for (const group of groups) {
    for (const target of group.implies) {
      if (!names.has(target))
        throw new Error(`group "${group.name}" implies unknown group "${target}"`);
    }
  }

  return { groups };
}

export function loadConfigFromFile(path: string): Config {
  const absolute = resolve(path);
  const source = readFileSync(absolute, 'utf8');
  return parseConfig(source);
}
