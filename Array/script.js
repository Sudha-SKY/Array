'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

///////////
//Functions

//Display the movements of deposits and Withdrawals
let displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  let movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    let type = mov > 0 ? 'deposit' : 'withdrawal';
    // console.log(type);
    let html = `<div class="movements__row">
                  <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
                  <div class="movements__value">${mov}€</div>
                </div>`;
    // console.log(html);
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//Create username with initials of first letters
const createUserName = function (accs) {
  accs.forEach(function (acc) {
    acc.userName = acc.owner
      .toLowerCase()
      .split(' ')
      .map(value => value[0])
      .join('');
  });
};
createUserName(accounts);

//calculate balance in account and display in the top-right corner
const calcDisplayBalance = function (accnt) {
  console.log(accnt);
  accnt.balance = accnt.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${accnt.balance} €`;
  console.log(accnt);
};

//calculate deposits, withdrawals, interest and display in IN, OUT and INTEREST
const calcDisplaySummary = function (accnt) {
  let income = accnt.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => (acc += mov), 0);
  labelSumIn.textContent = `${income} €`;

  let outgoing = accnt.movements
    .filter(mov => mov <= 0)
    .reduce((acc, mov) => (acc += mov), 0);
  labelSumOut.textContent = `${Math.abs(outgoing)} €`;

  let interest = accnt.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * accnt.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => (acc += int), 0);
  labelSumInterest.textContent = `${interest} €`;
};

//Updates the UI at login and after transactions
const updateUI = function (acc) {
  //Display movements
  displayMovements(acc.movements);

  //Display Balance
  calcDisplayBalance(acc);
  //Display Summary
  calcDisplaySummary(acc);
};

///////////////
//Event Handler

//Login Event Handler
let currentAccount = 0;
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.userName === inputLoginUsername.value
  );
  // console.log(currentAccount);
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //Display UI and Message
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split('')[0]
    }`;
    containerApp.style.opacity = 100;

    //clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //update the UI
    updateUI(currentAccount);
  }
});

//Button Transfer Event Handler
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  let amount = Number(inputTransferAmount.value);
  let receiverAcc = accounts.find(
    acc => acc.userName === inputTransferTo.value
  );
  // console.log(currentAccount);
  // console.log(receiverAcc);
  //cleanup after transfer
  inputTransferAmount.value = inputTransferTo.value = '';

  //validating the input amount before the transfer
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.userName !== currentAccount.userName
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    updateUI(currentAccount);
    // console.log(currentAccount);
    // console.log(receiverAcc);
  }
});

//Button Loan Event Handler
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  let amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount);
    updateUI(currentAccount);
  }
});

//Button Close Event Handler
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    currentAccount.userName === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    let index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    //delete account
    accounts.splice(index, 1);
    // console.log(accounts);
    // Hide UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

//Sort Event Handler
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//lecture workouts

//Create deposits and withdrawals array
/*const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
let deposits = movements.filter(function (mov) {
  return mov > 0;
});
console.log(movements);
console.log(deposits);

let withdrawals = movements.filter(function (mov) {
  return mov < 0;
});
console.log(movements);
console.log(withdrawals);

let balance = movements.reduce((acc, cur) => acc + cur, 0);
console.log(balance);
*/

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// Challenges

// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

/////////////////////////////////////////////////

// Coding Challenge #1

/* 
Julia and Kate are doing a study on dogs. 
So each of them asked 5 dog owners about their dog's age, 
and stored the data into an array (one array for each).
For now, they are just interested in knowing whether 
a dog is an adult or a puppy. A dog is an adult if it is 
at least 3 years old, and it's a puppy if it's less than 
3 years old.

Create a function 'checkDogs', which accepts 2 arrays of dog's ages 
('dogsJulia' and 'dogsKate'), and does the following things:

1. Julia found out that the owners of the FIRST and the LAST TWO dogs 
actually have cats, not dogs! So create a shallow copy of Julia's array,
 and remove the cat ages from that copied array 
 (because it's a bad practice to mutate function parameters)
2. Create an array with both Julia's (corrected) and Kate's data
3. For each remaining dog, log to the console whether it's an adult 
("Dog number 1 is an adult, and is 5 years old") or a puppy 
("Dog number 2 is still a puppy 🐶")
4. Run the function for both test datasets

TEST DATA 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3]
TEST DATA 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]

*/
/*
// Coding Challenge #1
console.log('Working with Arrays-- Coding Challenge #1');
let checkDogs = function (dogsJulia, dogsKate) {
  let dogsJuliaCopy = dogsJulia;
  dogsJuliaCopy.splice(3, 2);
  dogsJuliaCopy.splice(0, 1);
  console.log(dogsJuliaCopy);
  let dogs = dogsJuliaCopy.concat(dogsKate);
  console.log(dogs);
  for (let [i, age] of dogs.entries()) {
    age >= 3
      ? console.log(`Dog number ${i + 1} is an adult, and is ${age} years old`)
      : console.log(`Dog number ${i + 1} is still a puppy 🐶`);
  }
};

checkDogs([3, 5, 2, 12, 7], [4, 1, 15, 8, 3]);
checkDogs([9, 16, 6, 8, 3], [10, 5, 6, 1, 4]);
*/

// Coding Challenge #2
/*Let's go back to Julia and Kate's study about dogs. This time, they want to convert
dog ages to human ages and calculate the average age of the dogs in their study.
Your tasks:
Create a function 'calcAverageHumanAge', which accepts an arrays of dog's
ages ('ages'), and does the following things in order:
1. Calculate the dog age in human years using the following formula: if the dog is
<= 2 years old, humanAge = 2 * dogAge. If the dog is > 2 years old,
humanAge = 16 + dogAge * 4
2. Exclude all dogs that are less than 18 human years old (which is the same as
keeping dogs that are at least 18 years old)
3. Calculate the average human age of all adult dogs (you should already know
from other challenges how we calculate averages 😉)
4. Run the function for both test datasets
Test data:
§ Data 1: [5, 2, 4, 1, 15, 8, 3]
§ Data 2: [16, 6, 10, 5, 6, 1, 4]
*/
/*
console.log('Working with Arrays-- Coding Challenge #2\n\n ');

const calcAverageHumanAge = function (dogAges) {
  console.log(`Dog ages are ${dogAges}`);
  let humanAges = dogAges.map(dogAge =>
    dogAge <= 2 ? 2 * dogAge : 16 + 4 * dogAge
  );
  console.log(`Converted Human Ages are ${humanAges}`);
  let adults = humanAges.filter(humanAge => humanAge >= 18);
  console.log(`Adults are ${adults}`);
  let avgAdult =
    adults.reduce((acc, adult) => (acc += adult), 0) / adults.length;
  console.log(`Average adults age is ${avgAdult}\n\n`);
};

calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);
*/

// Coding Challenge #3

/* 
Rewrite the 'calcAverageHumanAge' function from the previous challenge, but
 this time as an arrow function, and using chaining!

TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

*/
/*
console.log('Working with Arrays-- Coding Challenge #3\n\n ');

const calcAverageHumanAge = function (dogAges) {
  // console.log(`Dog ages are ${dogAges}`);
  let avgAdult = dogAges
    .map(dogAge => (dogAge <= 2 ? 2 * dogAge : 16 + 4 * dogAge))
    .filter(humanAge => humanAge >= 18)
    .reduce((acc, adult, i, arr) => (acc += adult / arr.length), 0);

  console.log(`Average adults age is ${avgAdult}\n\n`);
};

calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);
*/

// Coding Challenge #4

/* 
Julia and Kate are still studying dogs, and this time they are studying if dogs are eating too much or too little.
Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little
is the opposite.Eating an okay amount means the dog's current food portion is within a range 10% above and 
10% below the recommended portion (see hint).

1. Loop over the array containing dog objects, and for each dog, calculate the recommended food portion and add it
 to the object as a new property. Do NOT create a new array, simply loop over the array. 
 Forumla: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)
2. Find Sarah's dog and log to the console whether it's eating too much or too little. HINT: Some dogs have multiple
 owners, so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) 🤓
3. Create an array containing all owners of dogs who eat too much ('ownersEatTooMuch') and an array with all owners
 of dogs who eat too little ('ownersEatTooLittle').
4. Log a string to the console for each array created in 3., like this: "Matilda and Alice and Bob's dogs eat too 
much!" and "Sarah and John and Michael's dogs eat too little!"
5. Log to the console whether there is any dog eating EXACTLY the amount of food that is recommended 
(just true or false)
6. Log to the console whether there is any dog eating an OKAY amount of food (just true or false)
7. Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)
8. Create a shallow copy of the dogs array and sort it by recommended food portion in an ascending order 
(keep in mind that the portions are inside the array's objects)

HINT 1: Use many different tools to solve these challenges, you can use the summary lecture to choose between them 😉
HINT 2: Being within a range 10% above and below the recommended portion means:
 current > (recommended * 0.90) && current < (recommended * 1.10). 
 Basically, the current portion should be between 90% and 110% of the recommended portion.

TEST DATA:
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] }
];

*/
/*
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

console.log('Working with Arrays-- Coding Challenge #4\n\n ');
console.log('Task 1');
// 1. Loop over the array containing dog objects, and for each dog, calculate the recommended food portion and add it
//  to the object as a new property. Do NOT create a new array, simply loop over the array.
//  Forumla: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)
dogs.forEach(
  dog => (dog.recommendedFood = Math.trunc(dog.weight ** 0.75 * 28))
);
console.log(dogs);

console.log('\nTask 2');
// 2. Find Sarah's dog and log to the console whether it's eating too much or too little.
// HINT: Some dogs have multiple owners, so you first need to find Sarah in the owners array,
// and so this one is a bit tricky (on purpose) 🤓
let sarahsDog = dogs.find(dog => dog.owners.includes('Sarah'));
console.log(sarahsDog);
console.log(
  `Sarah's dog is eating too ${
    sarahsDog.curFood > sarahsDog.recommendedFood ? 'much' : 'little'
  } food`
);
console.log('\nTask 3');
// 3. Create an array containing all owners of dogs who eat too much ('ownersEatTooMuch') and
// an array with all owners of dogs who eat too little ('ownersEatTooLittle').
let ownersEatTooMuch = dogs
  .filter(dog => dog.curFood > dog.recommendedFood)
  .flatMap(dog => dog.owners);
console.log(dogs);
console.log(ownersEatTooMuch);

let ownersEatTooLittle = dogs
  .filter(dog => dog.curFood < dog.recommendedFood)
  .flatMap(dog => dog.owners);
console.log(ownersEatTooLittle);

console.log('\nTask 4');
// 4. Log a string to the console for each array created in 3., like this: "Matilda and Alice and Bob's dogs eat too
// much!" and "Sarah and John and Michael's dogs eat too little!"
console.log(`${ownersEatTooMuch.join(' and ')}'s dogs eat too much!`);
console.log(`${ownersEatTooLittle.join(' and ')}'s dogs eat too little!`);

console.log('\nTask 5');
// 5. Log to the console whether there is any dog eating EXACTLY the amount of food that is recommended
// (just true or false)
console.log(dogs.some(dog => dog.recommendedFood === dog.curFood));

console.log('\nTask 6');
// 6. Log to the console whether there is any dog eating an OKAY amount of food (just true or false)
// current > (recommended * 0.90) && current < (recommended * 1.10).

// console.log(
//   dogs.find(
//     dog =>
//       dog.curFood > dog.recommendedFood * 0.9 &&
//       dog.curFood < dog.recommendedFood * 1.1
//   )
// );
console.log(
  dogs.some(
    dog =>
      dog.curFood > dog.recommendedFood * 0.9 &&
      dog.curFood < dog.recommendedFood * 1.1
  )
);

console.log('\nTask 7');
// 7. Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)

console.log(
  dogs.filter(
    dog =>
      dog.curFood > dog.recommendedFood * 0.9 &&
      dog.curFood < dog.recommendedFood * 1.1
  )
);

console.log('\nTask 8');
// 8. Create a shallow copy of the dogs array and sort it by recommended food portion in an ascending order
// (keep in mind that the portions are inside the array's objects)

let arr = dogs.slice().sort((a, b) => a.recommendedFood - b.recommendedFood);
console.log(arr);
*/
