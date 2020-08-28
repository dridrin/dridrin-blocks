/**
 * Copyright (c) AnotherBrain Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

// for scratch-gui

import logo from './logo_main.svg'

import defaultProject from './default-project'
import extensionInfo from './extension-info.jsx'

const SCRATCH_TRADEMARKS = [
  'Cat',
  'Cat-a',
  'Cat-b',
  'Cat Flying',
  'Cat Flying-a',
  'Cat Flying-b',
  'Gobo',
  'Gobo-a',
  'Gobo-b',
  'Gobo-c',
  'Pico',
  'Pico-a',
  'Pico-b',
  'Pico-c',
  'Pico-d',
  'Pico Walking',
  'Pico Walk1',
  'Pico Walk2',
  'Pico Walk3',
  'Pico Walk4',
  'Nano',
  'Nano-a',
  'Nano-b',
  'Nano-c',
  'Nano-d',
  'Tera',
  'Tera-a',
  'Tera-b',
  'Tera-c',
  'Tera-d',
  'Giga',
  'Giga-a',
  'Giga-b',
  'Giga-c',
  'Giga-d',
  'Giga Walking',
  'Giga Walk1',
  'Giga Walk2',
  'Giga Walk3',
  'Giga Walk4'
];

const spritesFilter = (sprites) => {
  return sprites.filter(
    (sprite) => !SCRATCH_TRADEMARKS.includes(sprite.name)
  )
};

export { logo, defaultProject, extensionInfo, spritesFilter }