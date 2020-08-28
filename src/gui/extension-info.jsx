/**
 * Copyright (c) AnotherBrain Inc.
 *
 * This source code is licensed under the BSD-3-Clause license found
 * in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {FormattedMessage} from 'react-intl';

import dridrinLogo from '../images/logo_extension.png'
import dridrinImage from '../images/dridrin.svg'

export default {
    name: 'DriDrin',
    extensionId: 'dridrin',
    collaborator: 'AnotherBrain Inc.',
    iconURL: dridrinLogo,
    insetIconURL: dridrinImage,
    description:(<FormattedMessage id='dridrin.info.description' default='vehicles are big toys' />),
    featured: true,
    disabled: false,
    internetConnectionRequired: true,
    // helpLink: 'https://github.com/dridrin/dridrin-blocks'
};
