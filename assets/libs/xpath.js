var arrKeyAttrs = ['resource-id', 'name', 'text'];
var mapIdCount = {};
var mapTextCount = {};
var mapNameCount = {};
var isScan = false;

function getChildIndex(node, nodes) {
  let index = 0;

  for (var i = 0; i < nodes.length; i++) {
    var item = nodes[i];

    if (item.class === node.class) {
      index++;
    }

    if (node === item) {
      break;
    }
  }

  return index;
}

function scanNode(nodes) {

  if (!isScan) {

    if (!nodes) {
      return;
    }

    for (let i = 0; i < nodes.length; i++) {
      let current = nodes[i];
      arrKeyAttrs.forEach(attr => {
        let value = current[attr];

        if (value) {
          switch (attr) {
            case 'resource-id':
              mapIdCount[value] = mapIdCount[value] && mapIdCount[value] + 1 || 1;
              break;
            case 'name':
              mapNameCount[value] = mapNameCount[value] && mapNameCount[value] + 1 || 1;
              break;
            case 'text':
              mapTextCount[value] = mapTextCount[value] && mapTextCount[value] + 1 || 1;
              break;
          }
        }
      });
      scanNode(current.nodes);
    }
  }
}

export default function getXpath(tree, nodePath, isIOS) {

  scanNode([tree]);
  isScan = true;

  const array = [];
  let nodes = [tree];
  const paths = [0, ...nodePath];

  if (isIOS) {

    for (let i = 0; i < paths.length; i++) {
      let current = nodes[paths[i]];
      let index = getChildIndex(current, nodes);
      array.push(`XCUIElementType${current.class}[${index}]`);
      nodes = current.nodes;
    }

    return `//${array.join('/')}`;
  } else {
    let XPath = '';

    for (let i = 0; i < paths.length; i++) {
      let current = nodes[paths[i]];
      let resourceId = current['resource-id'];
      let name = current['name'];
      let text = current['text'];
      let index = getChildIndex(current, nodes);

      if (resourceId && mapIdCount[resourceId] === 1) {
        XPath = `/*[@resource-id="${resourceId}"]`;
      } else if (name && mapNameCount[name] === 1) {
        XPath = `/*[@name="${name}"]`;
      } else if (text && mapTextCount[text] === 1) {
        XPath = `/*[@text="${text}"]`;
      } else {
        XPath = `${XPath}/${current.class}/[${index}]`;
      }
      nodes = current.nodes;
    }
    return `/${XPath}`;
  }
};
