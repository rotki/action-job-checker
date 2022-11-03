import {useCheckForTag} from '../src/commit'
import {Tag} from '../src/tags'

test('a commit matches the tag', () => {
  const commit = `Test commit message
    
   [run all]
    `
  const checkForTag = useCheckForTag(commit)
  expect(checkForTag(Tag.RUN_ALL)).toBe(true)
})

test('a commit does not match the tag', () => {
  const commit = 'Test commit message'
  const checkForTag = useCheckForTag(commit)
  expect(checkForTag(Tag.RUN_ALL)).toBe(false)
})
