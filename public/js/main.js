window.onload = function() {
  const hamburger = document.querySelector('.hamburger');
  hamburger.addEventListener('click', toggleNavigation);

  const formToggleBtns = document.querySelectorAll('.form-toggle__btn');
  formToggleBtns.forEach(function(elem) {
    elem.addEventListener('click', toggleForm);
  });

  const barbersBtns = document.querySelectorAll('fieldset.barbers label.btn');
  barbersBtns.forEach(function(elem) {
    elem.addEventListener('click', toggleRadioChecked);
  });

  const datesBtns = document.querySelectorAll('fieldset.dates label.btn');
  datesBtns.forEach(function(elem) {
    elem.addEventListener('click', toggleRadioChecked);
  });

  const timesBtns = document.querySelectorAll('fieldset.times label.btn');
  timesBtns.forEach(function(elem) {
    elem.addEventListener('click', toggleRadioChecked);
  });

  const checkboxBtns = document.querySelectorAll('fieldset.services label.btn');
  checkboxBtns.forEach(function(elem) {
    elem.addEventListener('click', toggleCheckboxChecked);
  });

  if(document.querySelector('title').text === 'Account manager') {
    let x = fillDates(7);
    console.log(x);
  }
};

function toggleForm () {
  const mainForm = document.querySelector('.form-wrapper form');

  if (this.classList.contains('form-toggle__btn--active')) {
    return
  } else {
    mainForm.classList.toggle('show-name');
  }

  if (mainForm.getAttribute('action') === '/login' && mainForm.classList.contains('show-name')) {
    mainForm.setAttribute('action', '/users/new')
  } else {
    mainForm.setAttribute('action', '/login')
  }

  const currentBtns = document.querySelectorAll('.form-toggle__btn');

  currentBtns.forEach(function(elem) {
    elem.classList.toggle('form-toggle__btn--active');
  });

  const submitBtn = document.querySelector('.form-wrapper input[type="submit"]');

  if (submitBtn.value === 'Sign in') {
    submitBtn.value = 'Sign up';
    submitBtn.addEventListener('click', function(event) {
      event.preventDefault();
      if (validation()) {
        mainForm.submit();
      }
    });
  } else {
    submitBtn.value = 'Sign in';
    submitBtn.removeEventListener('click');
  }

  //const nameField = document.querySelector('.form-wrapper input[name="username"]');

  //nameField.required ? nameField.required = false: nameField.required = true;
}


function toggleNavigation() {
  const navigationList = document.querySelector('.navigation__list');
  navigationList.classList.toggle('navigation__list--show');
};

function toggleRadioChecked() {
  let classname;
  if (this.parentNode.classList.contains('row')) {
    classname = this.parentNode.parentNode.classList[0];
  } else {
    classname = this.parentNode.classList[0];
  }
  const activeBtn = document.querySelector(`fieldset.${classname} label.btn--checked`);
  activeBtn.classList.remove('btn--checked');
  this.classList.add('btn--checked');
};

function toggleCheckboxChecked() {
  if (this.childNodes[1].checked === true) {
    this.childNodes[1].checked = false;
    this.classList.remove('btn--checked');
  } else {
    this.childNodes[1].checked = true;
    this.classList.add('btn--checked');
  }
};

function fillDates(days) {
  let fields = document.querySelectorAll('.dates label');
  let date = new Date();
  let currentValue;
  for (let i = 0; i < days; i++) {
    let input = document.createElement('input');
    input.type = 'radio';
    input.name = 'day';
    if (i === 0) {
      currentValue = `${date.getDate()}.${date.getMonth()+1}`;
      input.setAttribute('checked', 'true');
    } else {
      let nextDate = new Date();
      nextDate.setDate(date.getDate() + i);
      currentValue = `${nextDate.getDate()}.${nextDate.getMonth()+1}`;
    }
    input.id = `date${i+1}`;
    input.value = currentValue;
    fields[i].textContent = currentValue;
    fields[i].appendChild(input);
  }
};

function validation () {
  let username = document.querySelector('input[name="username"]');
  let email = document.querySelector('input[name="email"]');
  let password = document.querySelector('input[name="password"]');

  if (!username.value || !email.value || !password.value) {
    alert('All fields are required!');
    return false;
  }

  const emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if ( !(emailRegexp.test(email.value)) ) {
    alert('Type email in right format');
    return false;
  }

  if (password.value.length < 8) {
    alert ('Password should contain at least 8 characters');
    return false;
  }
  return true;
};
