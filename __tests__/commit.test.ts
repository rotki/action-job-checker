import { expect, it } from 'vitest';
import { useCheckForTag } from '../src/commit';
import { Tag } from '../src/tags';

it('a commit matches the tag', () => {
  const commit = `Test commit message
    
   [run all]
    `;
  const checkForTag = useCheckForTag(commit);
  expect(checkForTag(Tag.RUN_ALL)).toBe(true);
});

it('a commit does not match the tag', () => {
  const commit = 'Test commit message';
  const checkForTag = useCheckForTag(commit);
  expect(checkForTag(Tag.RUN_ALL)).toBe(false);
});
