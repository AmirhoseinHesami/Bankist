"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

const account1 = {
  owner: "Amirhosein Hesami",
  movements: [150, 465.25, -302.5, 23000, -645.21, -133.9, 79.97, 1250],
  interestRate: 1.2, // %
  pin: 1234,

  movementsDates: [
    "2021-11-18T21:31:17.178Z",
    "2021-12-23T07:42:02.383Z",
    "2022-01-20T09:15:04.904Z",
    "2022-01-28T10:17:24.185Z",
    "2022-02-08T14:11:59.604Z",
    "2022-03-02T17:01:17.194Z",
    "2022-03-04T23:36:17.929Z",
    "2022-03-06T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "de-DE",
};

const account2 = {
  owner: "Guest Account",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 1111,

  movementsDates: [
    "2021-11-01T13:15:33.035Z",
    "2021-11-30T09:48:16.867Z",
    "2021-12-25T06:04:23.907Z",
    "2022-01-25T14:18:46.235Z",
    "2022-02-05T16:33:06.386Z",
    "2022-02-10T14:43:26.374Z",
    "2022-03-03T18:49:59.371Z",
    "2022-03-05T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////

// Functions
const displayMovements = function (account) {
  containerMovements.innerHTML = "";

  account.forEach((acc, i) => {
    const status = acc > 0 ? "deposit" : "withdrawal";

    const element = `<div class="movements__row">
        <div class="movements__type movements__type--${status}">${
      i + 1
    } ${status}</div>
        <div class="movements__date">${i}</div>
        <div class="movements__value">${acc}€</div>
      </div>`;
    containerMovements.insertAdjacentHTML("afterbegin", element);
  });
};

const calcBalance = function (account) {
  account.balance = account.movements.reduce((acc, cur) => acc + cur, 0);
  labelBalance.textContent = account.balance;
};

const createUserName = function (account) {
  account.forEach((acc) => {
    const user = acc.owner.toLowerCase().split(" ");
    let userName = "";
    user.forEach((acc, i) => (userName += acc[0]));
    acc.username = userName;
  });
};
createUserName(accounts);

const displaySummary = function (account) {
  const inMov = account.movements
    .filter((acc) => acc > 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumIn.textContent = inMov;

  const outMov = account.movements
    .filter((acc) => acc < 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumOut.textContent = Math.abs(outMov).toFixed(2);

  const interest = account.movements
    .filter((acc) => acc > 0)
    .map((mov) => mov * (account.interestRate / 100))
    .filter((acc) => acc > 1)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumInterest.textContent = interest;
};

const updateUI = function () {
  displaySummary(currentUser);
  displayMovements(currentUser.movements);
  calcBalance(currentUser);
};

// Event listeners
let currentUser;

btnLogin.addEventListener("click", function (e) {
  e.preventDefault();
  const userInput = inputLoginUsername.value.toLowerCase();
  const pin = Number(inputLoginPin.value);
  currentUser = accounts.find((acc) => acc.username === userInput);

  if (currentUser?.pin === pin) {
    containerApp.style.opacity = 1;
    labelWelcome.textContent = `Welcome back, ${
      currentUser.owner.split(" ")[0]
    }`;

    updateUI();
  }

  inputLoginPin.value = "";
  inputLoginUsername.value = "";
  inputLoginPin.blur();
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();

  const receiver = inputTransferTo.value;
  const amount = Number(inputTransferAmount.value);

  const account = accounts.find((acc) => acc.username === receiver);

  if (
    account &&
    amount > 0 &&
    amount <= currentUser.balance &&
    currentUser?.username !== receiver
  ) {
    account.movements.push(amount);
    currentUser.movements.push(-amount);

    updateUI();
  }

  inputTransferAmount.value = "";
  inputTransferTo.value = "";
  inputTransferAmount.blur();
});
