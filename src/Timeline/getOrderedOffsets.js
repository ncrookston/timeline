import {map, reduce} from 'lodash';

export default function getOrderedOffsets(order, heights) {
  return reduce(map(order, id => heights[id]),
    (res,lvl) => res.concat(res[res.length-1] + lvl),
    [0]
  );
}

