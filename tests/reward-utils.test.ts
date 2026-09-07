import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeResizeDimensions, buildRewardConfigs } from '../src/lib/reward-utils.ts'

test('computeResizeDimensions: landscape scales by width', () => {
  assert.deepEqual(computeResizeDimensions(800, 400, 360), { width: 360, height: 180 })
})

test('computeResizeDimensions: portrait scales by height', () => {
  assert.deepEqual(computeResizeDimensions(400, 800, 360), { width: 180, height: 360 })
})

test('computeResizeDimensions: square scales evenly', () => {
  assert.deepEqual(computeResizeDimensions(1000, 1000, 360), { width: 360, height: 360 })
})

test('computeResizeDimensions: no upscaling when already small', () => {
  assert.deepEqual(computeResizeDimensions(200, 150, 360), { width: 200, height: 150 })
})

test('computeResizeDimensions: handles zero/invalid input', () => {
  assert.deepEqual(computeResizeDimensions(0, 100, 360), { width: 0, height: 0 })
})

test('buildRewardConfigs: 3 prizes unlock at 2/4/6 over 6 lessons', () => {
  const cfg = buildRewardConfigs(
    [
      { name: 'Panelita', imageUrl: 'data:a' },
      { name: 'Trululu', imageUrl: 'data:b' },
      { name: 'Hotwheels', imageUrl: 'data:c' },
    ],
    6
  )
  assert.equal(cfg.length, 3)
  assert.deepEqual(cfg.map((c) => c.lessonsRequired), [2, 4, 6])
  assert.deepEqual(cfg.map((c) => c.id), ['real_0', 'real_1', 'real_2'])
  assert.equal(cfg[0].imageUrl, 'data:a')
})

test('buildRewardConfigs: 1 prize requires all lessons but never 0', () => {
  const cfg = buildRewardConfigs([{ name: 'Big Prize', imageUrl: 'data:x' }], 6)
  assert.deepEqual(cfg.map((c) => c.lessonsRequired), [6])
})

test('buildRewardConfigs: 5 prizes give strictly increasing thresholds, min 1', () => {
  const cfg = buildRewardConfigs(
    Array.from({ length: 5 }, (_, i) => ({ name: `p${i}`, imageUrl: `d${i}` })),
    6
  )
  const reqs = cfg.map((c) => c.lessonsRequired)
  assert.ok(reqs.every((r) => r >= 1), 'all >= 1')
  for (let i = 1; i < reqs.length; i++) {
    assert.ok(reqs[i] >= reqs[i - 1], 'non-decreasing')
  }
  assert.equal(reqs[reqs.length - 1], 6, 'last unlocks at final lesson')
})

test('buildRewardConfigs: trims whitespace from names', () => {
  const cfg = buildRewardConfigs([{ name: '  Candy  ', imageUrl: 'd' }], 6)
  assert.equal(cfg[0].name, 'Candy')
})
