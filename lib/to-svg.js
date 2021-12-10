const toSVG = diagram => {
  const tree = diagram.format();

  Object.assign(tree.attrs, {
    xmlns: 'http://www.w3.org/2000/svg'
  });

  let string = tree.toString();
  let index = string.indexOf('\n');
  let style = `
  <style>
    svg.railroad-diagram {
        background-color: hsl(30,20%,95%);
    }
    svg.railroad-diagram path {
        stroke-width: 3;
        stroke: black;
        fill: none;
    }
    svg.railroad-diagram text {
        font: bold 12px monospace;
        text-anchor: middle;
    }
    svg.railroad-diagram text.label {
        text-anchor: start;
    }
    svg.railroad-diagram text.comment {
        font: italic 12px monospace;
    }
    svg.railroad-diagram rect {
        stroke-width: 3;
        stroke: black;
        fill: hsl(120,100%,90%);
    }
  </style>
  `;
  
  return string.substring(0, index) + style + string.substring(index);
};

module.exports = toSVG;