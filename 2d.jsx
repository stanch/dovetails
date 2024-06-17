import _ from 'lodash'

const minPinWidth = 3

export const points = dovetails => {
  const pinNarrowing = dovetails.thickness * Math.tan(dovetails.angle * Math.PI / 180) / 2

  // pin * (1 + tailToPin) = (dovetails.thickness / dovetails.density)
  const approxPinWidth = _.max([
    dovetails.thickness / dovetails.density / (1 + dovetails.tailToPin),
    minPinWidth + pinNarrowing * 2,
    (minPinWidth + pinNarrowing) / dovetails.halfPinSize
  ])

  // n * pin * (1 + tailToPin) + pin * halfPin * 2 + pin * tailToPin = width
  const n = Math.max(Math.floor(
    (dovetails.width - approxPinWidth * (dovetails.halfPinSize * 2 + dovetails.tailToPin)) / 
    approxPinWidth / (1 + dovetails.tailToPin)
  ), 0)

  // pin * (halfPin * 2 + n * (1 + tailToPin) + tailToPin) = width
  const pinWidth = dovetails.width / (dovetails.halfPinSize * 2 + n * (1 + dovetails.tailToPin) + dovetails.tailToPin)
  const halfPinWidth = pinWidth * dovetails.halfPinSize
  const pinWidths = _.times(n, _.constant(pinWidth))

  const averageTailWidth = pinWidth * dovetails.tailToPin
  const tailWidths = (() => {
    const m = Math.ceil((n + 1) / 2)
    if (m < 2) return _.times(n + 1, _.constant(averageTailWidth))
    // to derive this, consider (1) sum(widths) = averageTailWidth * n (2) tailVariation = maxWidth / baseWidth
    const baseWidth = ((n + 1) % 2) ?
      averageTailWidth * (2 * m - 1) / ((dovetails.tailVariation + 1) * (m - 1) + 1) :
      averageTailWidth * 2 / (dovetails.tailVariation + 1)
    const delta = baseWidth * (dovetails.tailVariation - 1) / (m - 1)
    return _.range(n + 1).map(i => baseWidth + delta * Math.min(i, n - i))
  })()

  const pinPoints = (() => {
    const fullPins = _.zip(_.dropRight(tailWidths, 1), pinWidths).reduce(
      ({items, offset}, [tail, pin]) => {
        const left = offset + tail
        const right = offset + tail + pin
        return {
          items: [...items, [left - pinNarrowing, left + pinNarrowing, right - pinNarrowing, right + pinNarrowing]],
          offset: right
        }
      },
      {items: [], offset: halfPinWidth}
    ).items
    const halfPins = [
      [0, 0, halfPinWidth - pinNarrowing, halfPinWidth + pinNarrowing],
      [dovetails.width - halfPinWidth - pinNarrowing, dovetails.width - halfPinWidth + pinNarrowing, dovetails.width, dovetails.width]
    ]
    return [halfPins[0], ...fullPins, halfPins[1]]
  })()

  const tailPoints = _.zipWith(
    _.dropRight(pinPoints, 1),
    _.drop(pinPoints, 1),
    ([lb1, lt1, rt1, rb1], [lb2, lt2, rt2, rb2]) => [rt1, rb1, lb2, lt2]
  )

  return { pinPoints, tailPoints }
}

const tailPath = (dovetails, tailPoints) =>
  `M 0 0 ` + tailPoints.map(([leftBottom, leftTop, rightTop, rightBottom]) =>
    `L 0 ${leftTop}
     L ${dovetails.thickness} ${leftBottom} 
     L ${dovetails.thickness} ${rightBottom} 
     L 0 ${rightTop}`
  ).join(" ") + `L 0 ${dovetails.width}`

export const Diagram = ({dovetails, tailPoints, format}) => {
  const twoSides = (i, j) => {
    const highlight = j == 1 || j == 2 ? "highlight" : ""
    return i*2 + j/2 < tailPoints.length ?
    <tspan className={highlight}>↑ {format(tailPoints[i][j])}</tspan> :
    <>
      <tspan className={highlight}>↓ {format(tailPoints[tailPoints.length-i-1][3-j])}</tspan>
      <tspan className="alternative"> (↑ {format(tailPoints[i][j])})</tspan>
    </>
  }

  return <svg xmlns="http://www.w3.org/2000/svg"
    viewBox={`-100 -10 ${dovetails.thickness + 200} ${dovetails.width + 20}`}>
    <path d={tailPath(dovetails, tailPoints)}/>
    <text className="marking-line" x={0} y={0}>{format(0)}</text>
    {tailPoints.map(([leftBottom, leftTop, rightTop, rightBottom], i) =>
      <g key={i}>
        <text className="edge" x={dovetails.thickness} y={leftBottom}>{twoSides(i, 0)}</text>
        <text className="edge" x={dovetails.thickness} y={rightBottom}>{twoSides(i, 3)}</text>
        <text className="marking-line" x={0} y={leftTop}>{twoSides(i, 1)}</text>
        <text className="marking-line" x={0} y={rightTop}>{twoSides(i, 2)}</text>
      </g>
    )}
    <text className="marking-line" x={0} y={dovetails.width}>{format(dovetails.width)}</text>
  </svg>
}
