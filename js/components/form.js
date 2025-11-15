function showModal(message, isSuccess = true) {
  const existingModal = document.querySelector('.modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.className = `modal ${isSuccess ? 'modal--success' : 'modal--error'}`;
  modal.innerHTML = `
    <div class="modal__overlay"></div>
    <div class="modal__content">
      <button class="modal__close" type="button" aria-label="Закрыть">
        <svg width="24" height="24" aria-hidden="true">
          <use xlink:href="images/sprite.svg#icon-close"></use>
        </svg>
      </button>
      <div class="modal__icon">
        ${isSuccess 
          ? '<svg width="60" height="60" fill="green"><circle cx="30" cy="30" r="28" fill="none" stroke="currentColor" stroke-width="4"/><path d="M20 30 l8 8 l16 -16" stroke="currentColor" stroke-width="4" fill="none"/></svg>'
          : '<svg width="60" height="60" fill="red"><circle cx="30" cy="30" r="28" fill="none" stroke="currentColor" stroke-width="4"/><path d="M20 20 l20 20 M40 20 l-20 20" stroke="currentColor" stroke-width="4"/></svg>'
        }
      </div>
      <p class="modal__message">${message}</p>
      <button class="modal__btn btn" type="button">Закрыть</button>
    </div>
  `;

  document.body.appendChild(modal);

  setTimeout(() => modal.classList.add('modal--active'), 10);

  const closeModal = () => {
    modal.classList.remove('modal--active');
    setTimeout(() => modal.remove(), 300);
  };

  modal.querySelector('.modal__close').addEventListener('click', closeModal);
  modal.querySelector('.modal__btn').addEventListener('click', closeModal);
  modal.querySelector('.modal__overlay').addEventListener('click', closeModal);

  document.addEventListener('keydown', function onEscape(e) {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', onEscape);
    }
  });
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
}

function validateName(name) {
  return name.trim().length >= 2;
}

function showFieldError(field, message) {
  const oldError = field.parentElement.querySelector('.field-error');
  if (oldError) oldError.remove();

  field.classList.add('custom-input__field--error');

  const errorEl = document.createElement('span');
  errorEl.className = 'field-error';
  errorEl.textContent = message;
  field.parentElement.appendChild(errorEl);
}

function clearFieldError(field) {
  field.classList.remove('custom-input__field--error');
  const error = field.parentElement.querySelector('.field-error');
  if (error) error.remove();
}

async function submitForm(formData) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.2;
      
      if (success) {
        resolve({ success: true, message: 'Форма успешно отправлена!' });
      } else {
        reject(new Error('Ошибка сервера. Попробуйте позже.'));
      }
    }, 1000);
  });
}

function validateFormFields(nameField, emailField) {
  let hasErrors = false;

  if (!validateName(nameField.value)) {
    showFieldError(nameField, 'Имя должно содержать минимум 2 символа');
    hasErrors = true;
  } else {
    clearFieldError(nameField);
  }

  if (!validateEmail(emailField.value)) {
    showFieldError(emailField, 'Введите корректный email');
    hasErrors = true;
  } else {
    clearFieldError(emailField);
  }

  return hasErrors;
}

function setSubmitButtonState(submitBtn, isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? 'Отправка...' : 'Отправить заявку';
}

function resetForm(form, nameField, emailField) {
  form.reset();
  clearFieldError(nameField);
  clearFieldError(emailField);
}

async function handleFormSubmit(e, form, submitBtn) {
  e.preventDefault();

  const nameField = form.querySelector('#name');
  const emailField = form.querySelector('#email');
  const agreeCheckbox = form.querySelector('#agree');

  const hasErrors = validateFormFields(nameField, emailField);

  if (!agreeCheckbox.checked) {
    showModal('Необходимо согласиться с политикой конфиденциальности', false);
    return;
  }

  if (hasErrors) return;

  setSubmitButtonState(submitBtn, true);

  try {
    const formData = {
      name: nameField.value,
      email: emailField.value,
      agree: agreeCheckbox.checked
    };

    await submitForm(formData);

    showModal('Спасибо! Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.', true);
    resetForm(form, nameField, emailField);

  } catch (error) {
    showModal('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.', false);
    console.error('Ошибка отправки формы:', error);
  } finally {
    setSubmitButtonState(submitBtn, false);
  }
}

function setupFieldValidation(field, validator, errorMessage) {
  field.addEventListener('blur', () => {
    if (!validator(field.value)) {
      showFieldError(field, errorMessage);
    } else {
      clearFieldError(field);
    }
  });

  field.addEventListener('input', () => {
    if (field.classList.contains('custom-input__field--error')) {
      if (validator(field.value)) {
        clearFieldError(field);
      }
    }
  });
}

export function initForm() {
  const form = document.querySelector('.questions__form');
  if (!form) return;

  const nameField = form.querySelector('#name');
  const emailField = form.querySelector('#email');
  const submitBtn = form.querySelector('[type="submit"]');

  if (nameField) {
    setupFieldValidation(nameField, validateName, 'Имя должно содержать минимум 2 символа');
  }

  if (emailField) {
    setupFieldValidation(emailField, validateEmail, 'Введите корректный email');
  }

  form.addEventListener('submit', (e) => handleFormSubmit(e, form, submitBtn));
}
