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
const formattedDate = function (locale, date) {
  const time = date - new Date();
  const daysPassed = Math.trunc(Math.abs(time) / 24 / 60 / 60 / 1000);
  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = "";

  const sorted = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  sorted.forEach((acc, i) => {
    const status = acc > 0 ? "deposit" : "withdrawal";

    const formattedMovDate = formattedDate(
      account.locale,
      new Date(account.movementsDates[i])
    );

    const formattedCur = formattedCurrency(
      acc,
      account.locale,
      account.currency
    );

    const element = `<div class="movements__row">
        <div class="movements__type movements__type--${status}">${
      i + 1
    } ${status}</div>
        <div class="movements__date">${formattedMovDate}</div>
        <div class="movements__value">${formattedCur}</div>
      </div>`;
    containerMovements.insertAdjacentHTML("afterbegin", element);
  });
};

const formattedCurrency = function (value, locale, curr) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: curr,
  }).format(value);
};

const calcBalance = function (account) {
  account.balance = account.movements.reduce((acc, cur) => acc + cur, 0);
  labelBalance.textContent = formattedCurrency(
    account.balance,
    account.locale,
    account.currency
  );
};

const createUserName = function (account) {
  account.forEach((acc) => {
    const user = acc.owner.toLowerCase().split(" ");
    let userName = "";
    user.forEach((acc) => (userName += acc[0]));
    acc.username = userName;
  });
};
createUserName(accounts);

const displaySummary = function (account) {
  const inMov = account.movements
    .filter((acc) => acc > 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumIn.textContent = formattedCurrency(
    inMov,
    account.locale,
    account.currency
  );

  const outMov = account.movements
    .filter((acc) => acc < 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumOut.textContent = formattedCurrency(
    Math.abs(outMov),
    account.locale,
    account.currency
  );

  const interest = account.movements
    .filter((acc) => acc > 0)
    .map((mov) => mov * (account.interestRate / 100))
    .filter((acc) => acc > 1)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumInterest.textContent = formattedCurrency(
    interest,
    account.locale,
    account.currency
  );
};

const updateUI = function () {
  displaySummary(currentUser);
  displayMovements(currentUser);
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

    const option = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    const date = new Intl.DateTimeFormat(currentUser.locale, option).format(
      new Date()
    );
    labelDate.textContent = date;
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
    account.movementsDates.push(new Date().toISOString());

    currentUser.movements.push(-amount);
    currentUser.movementsDates.push(new Date().toISOString());

    updateUI();
  }

  inputTransferAmount.value = "";
  inputTransferTo.value = "";
  inputTransferAmount.blur();
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Math.floor(Number(inputLoanAmount.value));

  if (amount > 0 && currentUser.movements.some((mov) => mov >= amount / 10)) {
    setTimeout(function () {
      currentUser.movements.push(amount);
      currentUser.movementsDates.push(new Date().toISOString());

      updateUI();
    }, 3000);

    inputLoanAmount.value = "";
    inputLoanAmount.blur();
  }
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  const closeUserName = inputCloseUsername.value;
  const closePin = Number(inputClosePin.value);

  if (
    currentUser?.username === closeUserName &&
    currentUser?.pin === closePin
  ) {
    const index = accounts.findIndex((acc) => acc.username === closeUserName);
    accounts.splice(index, 1);

    containerApp.style.opacity = 0;
    labelWelcome.textContent = "Log in to get started";
  }

  inputClosePin.value = "";
  inputCloseUsername.value = "";
});

let sort = false;

btnSort.addEventListener("click", function () {
  displayMovements(currentUser, !sort);
  sort = !sort;
});
