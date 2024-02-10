// The array must be sorted for binary search to work.
const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/*
search = 3
start = 0, 1 / end = 8, 9 / mid = 4, 5
5 > 3
start = 0, 1 / end = 3, 4 / mid = 1, 2
2 < 3
start = 2, 3 / end = 3, 4 / mid = 2, 3
3 = 3 -> return index 2
*/

/*
search = 3.5
start = 0, 1 / end = 8, 9 / mid = 4, 5
5 > 3
start = 0, 1 / end = 3, 4 / mid = 1, 2
2 < 3
start = 2, 3 / end = 3, 4 / mid = 2, 3
3 < 3.5
start = 3, 4 / end = 3, 4 / mid = 3, 4
4 > 3.5
start = 3 ,4 / end = 2, 3
*/

function binarySearch(array, element) {
  let start = 0;
  let end = array.length - 1;

  while (start <= end) {
    let mid = Math.floor((start + end) / 2);

    if (array[mid] === element) {
      // We must return the mid value, which represents the index value, once we have found the element being searched for.
      return mid;
    } else if (array[mid] < element) {
      start = mid + 1;
    } else {
      end = mid - 1;
    }
  }
  // If we do not find the element we need to return false.
  return -1;
}

console.log(binarySearch(arr, 7));

module.exports = binarySearch;
