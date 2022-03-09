export const getBingoCard = () => {
  let arr = [
    [], // b (1-15)
    [], // i (16-30)
    [], // n (31-45)
    [], // g (46-60)
    [], // o (51-75)
  ];

  for (let i = 0; i < arr.length; i++) {
    let min = i * 15 + 1;
    let max = min + 15;

    while (arr[i].length < 5) {
      let num = Math.floor(Math.random() * (max - min)) + min;

      if (!arr[i].includes(num)) {
        arr[i].push(num);
      }
    }

    arr[i].sort((a, b) => a - b);
  }

  return transpose(arr);
};

const transpose = (matrix) => {
  return Object.keys(matrix[0]).map(function (c) {
    return matrix.map((r) => {
      return r[c];
    });
  });
};
