// import base64js from 'base64-js'

import projectData from './project-data'

import backdrop from '!raw-loader!./cd21514d0531fdffb22204e0ec5ed84a.svg'
import costumeCar from '!raw-loader!./d378dbff9527c8b083919bbcdfe750cc.svg'
import costumeDriDrin from '!raw-loader!./2437968c23224ff2ed13aa34cc4fe64e.svg'

// const convertBase64ImageToByteArray = image =>
//   base64js.toByteArray(image.replace(/data:image\/[\w\+]+;base64,/, ''))

const defaultProject = translator => {
  const projectJson = projectData(translator)

  let _TextEncoder;
  if (typeof TextEncoder === 'undefined') {
      _TextEncoder = require('text-encoding').TextEncoder;
  } else {
      /* global TextEncoder */
      _TextEncoder = TextEncoder;
  }
  const encoder = new _TextEncoder();

  return [
    {
      id: 0,
      assetType: 'Project',
      dataFormat: 'JSON',
      data: JSON.stringify(projectJson)
    },
    {
      id: 'cd21514d0531fdffb22204e0ec5ed84a',
      assetType: 'ImageVector',
      dataFormat: 'SVG',
      data: encoder.encode(backdrop)
    },
    {
      id: 'd378dbff9527c8b083919bbcdfe750cc',
      assetType: 'ImageVector',
      dataFormat: 'SVG',
      data: encoder.encode(costumeCar)
    },
    {
      id: '2437968c23224ff2ed13aa34cc4fe64e',
      assetType: 'ImageVector',
      dataFormat: 'SVG',
      data: encoder.encode(costumeDriDrin)
    }
  ]
}

export default defaultProject
