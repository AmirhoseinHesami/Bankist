"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

const account1 = {
  owner: "Admin Account",
  movements: [150, 465.25, -302.5, 23000, -645.21, -133.9, 79.97, 1250],
  interestRate: 1.2, // %
  pin: 1111,

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
  pin: 2222,

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

const formatMovementsDate = function (locale, date) {
  const calcDays = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDays(date, new Date());

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = function (value, locale, curr) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: curr,
  }).format(value);
};

const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  movs.forEach(function (acc, i) {
    const status = acc > 0 ? "deposit" : "withdrawal";

    const displayDate = formatMovementsDate(
      account.locale,
      new Date(account.movementsDates[i])
    );

    const formattedMov = formatCurrency(acc, account.locale, account.currency);

    const element = `<div class="movements__row">
        <div class="movements__type movements__type--${status}">${
      i + 1
    } ${status}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>`;
    containerMovements.insertAdjacentHTML("afterbegin", element);
  });
};

const calcBalance = function (account) {
  account.balance = account.movements.reduce((acc, cur) => acc + cur, 0);
  labelBalance.textContent = formatCurrency(
    account.balance,
    account.locale,
    account.currency
  );
};

const createUserName = function (account) {
  account.forEach((acc) => {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};
createUserName(accounts);

const displaySummary = function (account) {
  const inMov = account.movements
    .filter((acc) => acc > 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumIn.textContent = formatCurrency(
    inMov,
    account.locale,
    account.currency
  );

  const outMov = account.movements
    .filter((acc) => acc < 0)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumOut.textContent = formatCurrency(
    Math.abs(outMov),
    account.locale,
    account.currency
  );

  const interest = account.movements
    .filter((acc) => acc > 0)
    .map((mov) => mov * (account.interestRate / 100))
    .filter((acc) => acc > 1)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumInterest.textContent = formatCurrency(
    interest,
    account.locale,
    account.currency
  );
};

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcBalance(acc);

  // Display summary
  displaySummary(acc);
};

const startLogOutTimer = function () {
  function tik() {
    const min = String(Math.floor(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = "Log in to get started";
    }

    // Decrease 1s
    time--;
  }

  // Set time to 2 minutes
  let time = 120;

  // Call the timer every second
  tik();
  const timer = setInterval(tik, 1000);

  return timer;
};

const printWelcome = function (name) {
  const now = new Date();
  const greeting = new Map([
    [[6, 7, 8, 9, 10], "Good Morning"],
    [[11, 12, 13, 14], "Good Day"],
    [[15, 16, 17, 18], "Good Afternoon"],
    [[19, 20, 21, 22], "Good Evening"],
    [[23, 0, 1, 2, 3, 4, 5], "Good Night"],
  ]);

  const arr = [...greeting.keys()].find((key) => key.includes(now.getHours()));
  const greet = greeting.get(arr);

  labelWelcome.textContent = `${greet}, ${name}!`;
};

///////////////////////////////////////
// Event handlers
let currentUser, timer;

btnLogin.addEventListener("click", function (e) {
  // Prevent form from submitting
  e.preventDefault();

  const userInput = inputLoginUsername.value.toLowerCase().trim();
  const pin = Number(inputLoginPin.value);

  currentUser = accounts.find((acc) => acc.username === userInput);

  if (currentUser?.pin === pin) {
    // Display UI and message
    containerApp.style.opacity = 1;
    printWelcome(currentUser.owner.split(" ")[0]);

    // Display date
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

    // Reset sort
    sort = false;

    // Update UI
    updateUI(currentUser);

    // Logout timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
  } else {
    containerApp.style.opacity = 0;
    labelWelcome.textContent = "Log in to get started";
  }

  // Clear input fields
  inputLoginPin.value = inputLoginUsername.value = "";
  inputLoginPin.blur();
  inputLoginUsername.blur();
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const recieverAccount = accounts.find(
    (acc) => acc.username === inputTransferTo.value.toLowerCase().trim()
  );

  if (
    recieverAccount &&
    amount > 0 &&
    amount <= currentUser.balance &&
    recieverAccount?.username !== currentUser.username
  ) {
    // Doing the transfer
    recieverAccount.movements.push(amount);
    currentUser.movements.push(-amount);

    // Push dates
    recieverAccount.movementsDates.push(new Date().toISOString());
    currentUser.movementsDates.push(new Date().toISOString());

    // Reset sort
    sort = false;

    // Update UI
    updateUI(currentUser);

    // Logout timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }

  // Clear input fields
  inputTransferAmount.value = inputTransferTo.value = "";
  inputTransferAmount.blur();
  inputTransferTo.blur();
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Math.floor(Number(inputLoanAmount.value));

  if (amount > 0 && currentUser.movements.some((mov) => mov >= amount / 10)) {
    setTimeout(function () {
      // Add movement
      currentUser.movements.push(amount);

      // Date
      currentUser.movementsDates.push(new Date().toISOString());

      // Reset sort
      sort = false;

      // Update UI
      updateUI(currentUser);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 3000);
  }

  // Clear input fields
  inputLoanAmount.value = "";
  inputLoanAmount.blur();
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  const closeUserName = inputCloseUsername.value.toLowerCase().trim();
  const closePin = Number(inputClosePin.value);

  if (currentUser.username === closeUserName && currentUser.pin === closePin) {
    const index = accounts.findIndex((acc) => acc.username === closeUserName);

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
    labelWelcome.textContent = "Log in to get started";
  }

  // Clear input fields
  inputClosePin.value = inputCloseUsername.value = "";
  inputClosePin.blur();
  inputCloseUsername.blur();
});

let sort = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentUser, !sort);
  sort = !sort;
});
