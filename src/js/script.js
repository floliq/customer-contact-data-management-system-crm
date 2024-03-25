(function () {
  const clientAddBtn = document.querySelector('.clients__add');
  const tableBody = document.querySelector('.clients__body');
  const sortBtns = document.querySelectorAll('.clients__sort');
  const filterInput = document.querySelector('.menu__find');
  let clientsList = [];
  let resultList = [];
  let isFiltered = false;

  function renderAllClients(clientsArray) {
    tableBody.innerHTML = '';
    for (const client of clientsArray) {
      getClientItem(client);
    }
  }

  async function getAllClients() {
    const responce = await fetch('http://localhost:3000/api/clients');
    clientsList = await responce.json();
    renderAllClients(clientsList);
  }

  const date = (dateObj) => {
    const fullDate = new Date(dateObj);
    const year = fullDate.getFullYear();
    let month = fullDate.getMonth() + 1;
    if (month < 10) month = `0${month}`;
    let day = fullDate.getDate();
    if (day < 10) day = `0${day}`;
    let hour = fullDate.getHours();
    if (hour < 10) hour = `0${hour}`;
    let minutes = fullDate.getMinutes();
    if (minutes < 10) minutes = `0${minutes}`;
    return [`${day}.${month}.${year}`, `${hour}:${minutes}`];
  };

  function getToolTip(value, type = null) {
    let newValue = '';
    if (type) {
      newValue = `${type}: <a class='clients__tooltip-link' target='_blank' href='${value}'>
        ${value.replace('https://vk.com/', '@').replace('https://fb.com/', '@')}</a>`;
    } else newValue = value;
    return newValue;
  }

  function getFirstLetter(str) {
    if (str === '') return str;
    const strOne = str.toLowerCase().trim();
    const strTwo = strOne[0].toUpperCase() + strOne.slice(1);
    return strTwo;
  }

  function openModal(title, obj) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal__content');
    createModal(modal, modalContent, title, obj);
    const action = () => {
      modal.classList.add('visibility', 'fixed', 'opacity');
      modalContent.classList.add('scale', 'opacity');
    };

    setTimeout(action, 100);

    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal(modal, modalContent);
    })
  }

  function closeModal(modal, modalContent) {
    modalContent.classList.remove('scale', 'opacity');
    modal.classList.remove('visibility', 'opacity');
    const action = () => {
      modal.classList.remove('fixed');
      modal.remove();
    };

    setTimeout(action, 400);
  }

  function createModal(modal, modalContent, title, obj = null) {
    const modalTitle = document.createElement('h2');
    modalTitle.classList.add('modal__heading');
    modalTitle.innerText = title;

    const form = document.createElement('form');
    form.classList.add('modal__form');

    const [surnameCont, nameCont, fullCont] = Array(3)
      .fill()
      .map(() => {
        const container = document.createElement('div');
        container.classList.add('modal__container');
        form.append(container);
        return container;
      });

    const [surnameInput, nameInput, fullInput] = Array(3)
      .fill()
      .map(() => {
        const input = document.createElement('input');
        input.classList.add('modal__input');
        input.type = 'text';
        return input;
      });

    const [surnameLabel, nameLabel, fullLabel] = Array(3)
      .fill()
      .map(() => {
        const label = document.createElement('label');
        label.classList.add('modal__label');
        return label;
      });

    const [closeBtn, addContactBtn, saveBtn, cancelBtn] = Array(5)
      .fill()
      .map(() => document.createElement('button'));

    surnameInput.id = 'surname';
    surnameInput.setAttribute('requared', '');
    surnameInput.setAttribute('aria-label', 'Фамилия');
    nameInput.id = 'name';
    nameInput.setAttribute('requared', '');
    nameInput.setAttribute('aria-label', 'Имя');
    fullInput.id = 'fathername';
    surnameLabel.innerHTML = 'Фамилия<span class="modal__label-requared">*</span>';
    surnameLabel.setAttribute('for', 'surname');
    nameLabel.innerHTML = 'Имя<span class="modal__label-requared">*</span>';
    nameLabel.setAttribute('for', 'name');
    fullLabel.innerText = 'Отчество';
    fullLabel.setAttribute('for', 'fathername');
    surnameCont.append(surnameInput, surnameLabel);
    nameCont.append(nameInput, nameLabel);
    fullCont.append(fullInput, fullLabel);

    closeBtn.classList.add('modal__close');
    closeBtn.innerHTML = `<svg width='29' height='29'>
      <use xlink:href='img/sprite.svg#close'></use>
      </svg>`;
    addContactBtn.classList.add('modal__addcontact');
    addContactBtn.innerHTML = `<svg class='modal__addcontact-pic' width='16' height='16'>
      <use class='modal__addcontact-def' xlink:href='img/sprite.svg#add-contact'></use>
      <use class='modal__addcontact-hover' xlink:href='img/sprite.svg#add-contact-out'></use>
      </svg><span class='modal__addcontact-text'>Добавить контакт</span>`;
    saveBtn.classList.add('modal__save');
    saveBtn.innerText = 'Сохранить';
    cancelBtn.classList.add('modal__cancel');
    cancelBtn.innerText = 'Отмена';
    const addPhone = document.createElement('div');
    addPhone.classList.add('modal__addphone');
    const contacts = document.createElement('div');
    contacts.classList.add('modal__contacts');
    addPhone.append(contacts, addContactBtn);
    const errorList = document.createElement('ol');
    errorList.classList.add('modal__errors');

    const id = document.createElement('span');
    if (obj) {
      id.classList.add('modal__heading-id', 'opacity', 'visibility');
      id.textContent = `ID: ${obj.id}`;
      modalTitle.append(id);
      surnameInput.value = obj.surname;
      nameInput.value = obj.name;
      fullInput.value = obj.lastName;
      const objContacts = obj.contacts;
      objContacts.forEach((contact) => addContact(null, contact));
    }

    if (title === 'Новый клиент') {
      form.append(addPhone, errorList, saveBtn);
      modalContent.append(modalTitle, closeBtn, form, cancelBtn);
    } else if (title === 'Изменить данные') {
      form.append(addPhone, errorList, saveBtn);
      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('modal__cancel');
      deleteBtn.innerText = 'Удалить клиента';
      modalContent.append(modalTitle, closeBtn, form, deleteBtn);
      deleteBtn.addEventListener('click', () => openModal('Удалить клиента', obj));
    } else {
      id.classList.remove('opacity', 'visibility');
      const message = document.createElement('p');
      message.classList.add('modal__message');
      message.textContent = 'Вы действительно хотите удалить данного клиента?';
      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('modal__save');
      deleteBtn.innerText = 'Удалить';
      modalContent.append(modalTitle, closeBtn, message, deleteBtn, cancelBtn);
      deleteBtn.addEventListener('click', () => deleteContact(event, obj.id, modal, modalContent));
    }

    modal.append(modalContent);
    document.querySelector('main').append(modal);

    closeBtn.addEventListener('click', () => closeModal(modal, modalContent));
    cancelBtn.addEventListener('click', () => closeModal(modal, modalContent));

    const inputs = document.querySelectorAll('.modal__input');
    inputs.forEach((input) => {
      if (input.value.length) {
        input.nextElementSibling.classList.add('modal__label-selected');
      }
      input.onfocus = () => input.nextElementSibling.classList.add('modal__label-selected');
      input.onblur = () => {
        if (!input.value.length) {
          input.nextElementSibling.classList.remove('modal__label-selected');
        }
        return false;
      };
    });

    // добавление контакта
    function addContact(event, contactObj = { type: null, value: null }) {
      if (event) event.preventDefault();
      const MAX_COUNT_CONTACTS = 10;
      const allContacts = document.querySelectorAll('.modal__contact');

      addPhone.classList.add('modal__addphone-opened');
      const contact = document.createElement('div');
      contact.classList.add('modal__contact');

      const contactSelect = document.createElement('div');
      contactSelect.classList.add('modal__select');
      const contactSelectHead = document.createElement('div');
      contactSelectHead.classList.add('modal__select-head');

      contactSelect.append(contactSelectHead);
      const contactSelectBody = document.createElement('div');
      contactSelectBody.classList.add('modal__select-body');
      const [
        phoneOption,
        addPhoneOption,
        mailOption,
        vkOption,
        fbOption,
      ] = Array(5)
        .fill()
        .map(() => {
          const option = document.createElement('div');
          option.classList.add('modal__option');
          contactSelectBody.append(option);
          return option;
        });

      phoneOption.innerText = 'Телефон';
      addPhoneOption.innerText = 'Другое';
      mailOption.innerText = 'Email';
      vkOption.innerText = 'Vk';
      fbOption.innerText = 'Facebook';
      contactSelectHead.innerText = contactObj.type || contactSelectBody.childNodes[0].innerText;
      contactSelect.append(contactSelectBody);

      const contactValue = document.createElement('input');
      contactValue.classList.add('modal__value');
      contactValue.setAttribute('placeholder', 'Введите данные контакта');
      contactValue.type = 'tel';
      contactValue.setAttribute('requared', '');
      Inputmask('+7 (999)-999-99-99').mask(contactValue);
      const contactDelete = document.createElement('button');
      contactDelete.classList.add('modal__del');
      contactDelete.innerHTML = `<svg class='modal__del-pic' width='16' height='16'>
        <use xlink:href='img/sprite.svg#cancel'></use>
        </svg>`;
      tippy(contactDelete, {
        content: 'Удалить контакт',
        interactive: true,
        allowHTML: true,
      });
      contact.append(contactSelect, contactValue, contactDelete);
      contacts.append(contact);
      addPhone.prepend(contacts);

      if (contacts.childNodes.length === MAX_COUNT_CONTACTS) {
        addContactBtn.classList.add('modal__addcontact-disabled');
        addContactBtn.setAttribute('disabled', '');
      }

      contactDelete.addEventListener('click', (event) => {
        event.preventDefault();
        contact.remove();
        addContactBtn.classList.remove('hidden');
        if (!allContacts.length) addPhone.classList.remove('modal__addphone-opened');
        if (contacts.childNodes.length !== MAX_COUNT_CONTACTS) {
          addContactBtn.classList.remove('modal__addcontact-disabled');
          addContactBtn.removeAttribute('disabled');
        }
      });

      const checkSelectHead = () => {
        const selectHead = contactSelectHead.innerText;
        contactValue.value = '';
        console.log(selectHead)
        switch (selectHead) {
          case 'Телефон':
            contactValue.setAttribute('maxlength', 18);
            contactValue.setAttribute('aria-label', 'Телефон');
            contactValue.type = 'tel';
            Inputmask('+7 (999)-999-99-99').mask(contactValue);
            break;
          case 'Другое':
            contactValue.setAttribute('maxlength', 18);
            contactValue.setAttribute('aria-label', 'Другое');
            contactValue.type = 'text';
            Inputmask('*{1,30}', {
              definitions: {
                '*': {
                  validator: '[A-Za-z0-9_:@ ]',
                  cardinality: 1,
                  casing: 'lower',
                },
              },
            }).mask(contactValue);
            break;
          case 'Email':
            contactValue.type = 'text';
            contactValue.setAttribute('aria-label', 'Email');
            contactValue.removeAttribute('maxlength');
            Inputmask('email').mask(contactValue);
            break;
          case 'Vk':
            contactValue.type = 'url';
            contactValue.setAttribute('aria-label', 'Vk');
            contactValue.removeAttribute('maxlength');
            contactValue.dataset.url = 'vk.com';
            Inputmask('https://vk.com/*{1,30}', {
              definitions: {
                '*': {
                  validator: '[A-Za-z0-9_]',
                  cardinality: 1,
                  casing: 'lower',
                },
              },
            }).mask(contactValue);
            break;
          case 'Facebook':
            contactValue.type = 'url';
            contactValue.setAttribute('aria-label', 'Facebook');
            contactValue.removeAttribute('maxlength');
            contactValue.dataset.url = 'fb.com';
            Inputmask('https://fb.com/*{1,30}', {
              definitions: {
                '*': {
                  validator: '[A-Za-z0-9_]',
                  cardinality: 1,
                  casing: 'lower',
                },
              },
            }).mask(contactValue);
            break;
          default:
            contactValue.setAttribute('maxlength', 18);
            contactValue.type = 'text';
            Inputmask('*{1,30}', {
              definitions: {
                '*': {
                  validator: '[A-Za-z0-9_:@ ]',
                  cardinality: 1,
                  casing: 'lower',
                },
              },
            }).mask(contactValue);
            break;
        }
        if (selectHead === contactObj.type){
          contactValue.value = contactObj.value;
        }
        else{
          contactValue.value = '';
        }
      };

      const checkSelectBody = () => contactSelectBody.childNodes.forEach((option) => {
        if (contactSelectHead.innerText === option.innerText) option.classList.add('hidden');
        else option.classList.remove('hidden');
      });

      checkSelectBody();
      checkSelectHead();

      function selectOption(event) {
        event.preventDefault();
        const el = event.target;
        if (contactSelectHead === el) return false;
        contactSelectHead.innerText = el.innerText;
        checkSelectBody();
        checkSelectHead();
      }

      modal.addEventListener('click', (event) => {
        const target = event.target;
        if (target === contactSelectHead) {
          contactSelectBody.classList.toggle('modal__select-opened');
        } else {
          contactSelectBody.classList.remove('modal__select-opened');
        }
      });

      contactSelectBody.childNodes.forEach((option) => option.addEventListener('click', selectOption));
    }

    addContactBtn.addEventListener('click', addContact);

    function isValidData(input) {
      const type = input.type;
      const value = input.value;
      const ariaLabel = input.getAttribute('aria-label');
      if (!value.length) return false;
      if (type === 'tel') {
        if (value.includes('_')) return false;
      } else if (type === 'text' && ariaLabel !== 'Другое') {
        const regexEmail = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i);
        if (!regexEmail.test(value)) return false;
      }
      return true;
    }

    function validate() {
      let isValid = true;
      errorList.innerHTML = '';
      for (const input of inputs) {
        input.classList.remove('modal__input-error');
        if (input.attributes.requared && !input.value.length) {
          input.classList.add('modal__input-error');
          const placeholder = input.getAttribute('aria-label');
          const error = document.createElement('li');
          error.classList.add('modal__error');
          error.innerHTML = `${placeholder} неправильно заполнено`;
          errorList.append(error);
          isValid = false;
        }
      }
      const contacts = document.querySelectorAll('.modal__value');
      if (contacts.length) {
        for (const contact of contacts) {
          contact.classList.remove('modal__value-error');
          if (contact.attributes.requared && !isValidData(contact)) {
            contact.classList.add('modal__value-error');
            const placeholder = contact.getAttribute('aria-label');
            const error = document.createElement('li');
            error.classList.add('modal__error');
            error.innerHTML = `${placeholder} неправильно заполнено`;
            errorList.append(error);
            isValid = false;
          }
        }
      }
      return isValid;
    }

    async function addNewClient(surname, name, lastName, contactsData) {
      await fetch('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify({
          surname: surname.trim(),
          name: name.trim(),
          lastName: lastName.trim(),
          contacts: contactsData,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    async function updateContact(
      contactId,
      surname,
      name,
      lastName,
      contactsData,
    ) {
      await fetch(`http://localhost:3000/api/clients/${contactId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          surname: surname.trim(),
          name: name.trim(),
          lastName: lastName.trim(),
          contacts: contactsData,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    async function deleteContact(event, clientId, modal, modalContent) {
      event.preventDefault();
      await fetch(`http://localhost:3000/api/clients/${clientId}`, {
        method: 'DELETE',
      });
      closeModal(modal, modalContent);
      document.querySelector('.modal').remove();
      getAllClients();
    }

    saveBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      if (validate()) {
        const idTag = document.querySelector('.modal__heading-id');
        let idClient = '';
        if (idTag) idClient = idTag.innerText.replace(/\D/g, '');
        const surname = getFirstLetter(surnameInput.value.toLowerCase());
        const name = getFirstLetter(nameInput.value.toLowerCase());
        const lastName = getFirstLetter(fullInput.value.toLowerCase());
        let contactsType = document.querySelectorAll('.modal__select-head');
        contactsType = Array.from(contactsType).map((element) => element.innerHTML);
        let contactsValue = document.querySelectorAll('.modal__value');
        contactsValue = Array.from(contactsValue).map((element) => element.value);
        const contactsData = Array.from(contactsType).map((element, index) => ({
          type: element,
          value: contactsValue[index],
        }));
        if (!idClient.length) await addNewClient(surname, name, lastName, contactsData);
        else await updateContact(idClient, surname, name, lastName, contactsData);
        closeModal(modal, modalContent);
        getAllClients();
      } else console.log('bad');
    });
  }

  function loading(el) {
    const svgElement = el.childNodes[0];
    svgElement.classList.add('client__spin');
    const useElements = svgElement.querySelectorAll('use');
    useElements.forEach((element) => {
      element.classList.toggle('hidden');
    });
    setTimeout(() => {
      svgElement.classList.remove('client__spin');
      useElements.forEach((element) => {
        element.classList.toggle('hidden');
      });
    }, 300);
  }

  function getClientItem(obj) {
    const MAX_VISIBLE_CONTACT = 4;
    const row = document.createElement('tr');
    const col1 = document.createElement('td');
    const col2 = document.createElement('td');
    const col3 = document.createElement('td');
    const col4 = document.createElement('td');
    const col5 = document.createElement('td');
    const col6 = document.createElement('td');

    row.classList.add('client');
    col1.classList.add('client__data', 'client__data-id');
    col2.classList.add('client__data', 'client__data-fullname');
    col3.classList.add('client__data', 'client__data-date');
    col4.classList.add('client__data', 'client__data-last');
    col5.classList.add('client__data', 'client__data-socials');
    col6.classList.add('client__data', 'client__data-btns');

    const [createDate, createTime] = date(obj.createdAt);
    const [updateDate, updateTime] = date(obj.updatedAt);

    const socials = document.createElement('div');
    socials.classList.add('clients__social');
    const contacts = obj.contacts;
    let limit = false;
    contacts.forEach((contact, index) => {
      const contactBtn = document.createElement('button');
      contactBtn.classList.add('clients__contact');
      let sprite = '';
      switch (contact.type) {
        case 'Телефон':
          sprite = 'phone';
          break;
        case 'Email':
          sprite = 'mail';
          break;
        case 'Vk':
          sprite = 'vk';
          break;
        case 'Facebook':
          sprite = 'fb';
          break;
        default:
          sprite = 'other';
          break;
      }
      const tooltip = ['Facebook', 'Vk'].includes(contact.type)
        ? getToolTip(contact.value, contact.type)
        : getToolTip(contact.value);
      contactBtn.innerHTML = `<svg class='clients__contactsvg' width='16' height='16'>
        <use xlink:href='img/sprite.svg#${sprite}'></use>
        </svg>`;
      tippy(contactBtn, {
        content: tooltip,
        interactive: true,
        allowHTML: true,
      });
      if (index >= MAX_VISIBLE_CONTACT) {
        contactBtn.classList.add('hidden');
        limit = true;
      }
      socials.append(contactBtn);
    });

    if (limit) {
      const moreContactsBtn = document.createElement('button');
      moreContactsBtn.classList.add('clients__more');
      const countButtons = socials.childNodes.length;
      const countContacts = countButtons - MAX_VISIBLE_CONTACT;
      moreContactsBtn.innerText = `+${countContacts}`;
      socials.append(moreContactsBtn);

      moreContactsBtn.addEventListener('click', () => {
        const buttons = socials.childNodes;
        buttons.forEach((btn) => {
          btn.classList.remove('hidden');
        });
        moreContactsBtn.remove();
      });
    }

    const btns = document.createElement('div');
    btns.classList.add('client__btns');
    const editBtn = document.createElement('button');
    editBtn.classList.add('client__change', 'client__btn');
    editBtn.innerHTML = `<svg width='16' height='16'>
      <use xlink:href='img/sprite.svg#edit'></use>
      <use class='hidden' xlink:href='img/sprite.svg#load'></use>
      </svg><span class='client__change-text'>Изменить</span>`;
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('client__delete', 'client__btn');
    deleteBtn.innerHTML = `<svg class='client__delete-pic' width='16' height='16'>
      <use xlink:href='img/sprite.svg#cancel'></use>
      <use class='hidden' xlink:href='img/sprite.svg#load-cancel'></use>
      </svg><span class='client__delete-text'>Удалить</span>`;
    btns.append(editBtn, deleteBtn);

    col1.innerText = obj.id;
    col2.innerText = `${obj.surname} ${obj.name} ${obj.lastName}`;
    col3.innerHTML = `${createDate}<span class='client__data-hour'>${createTime}</span>`;
    col4.innerHTML = `${updateDate}<span class='client__data-hour'>${updateTime}</span>`;
    col5.append(socials);
    col6.append(btns);
    row.append(col1, col2, col3, col4, col5, col6);
    tableBody.append(row);

    editBtn.addEventListener('click', (event) => {
      const target = event.currentTarget;
      loading(target);
      openModal('Изменить данные', obj);
    });

    deleteBtn.addEventListener('click', (event) => {
      const target = event.currentTarget;
      loading(target);
      openModal('Удалить клиента', obj);
    });
  }
  // создание модального окна

  clientAddBtn.addEventListener('click', () => {
    openModal('Новый клиент');
  });

  function resetSort(clickedSort) {
    sortBtns.forEach((btn) => {
      const sortBtnClass = btn.classList[1];
      if (sortBtnClass !== clickedSort) {
        btn.classList.remove('up', 'down');
      }
    });
  }

  const sortClients = (arr, prop, dir = false) => arr.sort((a, b) => (!dir ? a[prop] < b[prop]
    : a[prop] > b[prop]) ? -1 : 0);

  function sort(event) {
    const target = event.currentTarget;
    const sortClass = target.classList[1];
    isFiltered = filterInput.value !== '';
    if (!target.classList.contains('up') && !target.classList.contains('down')) {
      target.classList.add('up');
    } else if (target.classList.contains('up')) {
      target.classList.replace('up', 'down');
    } else {
      target.classList.replace('down', 'up');
    }
    switch (sortClass) {
      case 'clients__sort-id':
        if (!isFiltered) {
          sortClients(clientsList, 'id', !target.classList.contains('up'));
        } else {
          sortClients(resultList, 'id', !target.classList.contains('up'));
        }
        break;
      case 'clients__sort-fullname':
        if (!isFiltered) {
          sortClients(clientsList, 'surname', !target.classList.contains('up'));
        } else {
          sortClients(resultList, 'surname', !target.classList.contains('up'));
        }
        break;
      case 'clients__sort-create':
        if (!isFiltered) {
          sortClients(clientsList, 'createdAt', !target.classList.contains('up'));
        } else {
          sortClients(resultList, 'createdAt', !target.classList.contains('up'));
        }
        break;
      case 'clients__sort-last':
        if (!isFiltered) {
          sortClients(clientsList, 'updatedAt', !target.classList.contains('up'));
        } else {
          sortClients(resultList, 'updatedAt', !target.classList.contains('up'));
        }
        break;
      default:
        break;
    }
    if (!isFiltered) {
      renderAllClients(clientsList);
    } else {
      renderAllClients(resultList);
    }
    resetSort(sortClass);
  }

  sortBtns.forEach((btn) => btn.addEventListener('click', sort));

  function filter(arr, prop, value) {
    resultList = [];
    isFiltered = true;
    const copy = [...arr];
    for (const item of copy) {
      if (typeof prop === 'object') {
        for (const pr of prop) {
          if (
            String(item[pr])
              .toLowerCase()
              .includes(value) === true
          ) {
            resultList.push(item);
            break;
          }
        }
      }
    }
    return resultList;
  }

  filterInput.addEventListener('input', (event) => {
    event.preventDefault();
    const value = filterInput.value.toLowerCase();
    let newArray = [...clientsList];
    if (value !== '') {
      newArray = filter(newArray, ['surname', 'name', 'lastName'], value);
    }
    renderAllClients(newArray);
  });

  function spin(table) {
    table.innerHTML = '';
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    tr.classList.add('spin');
    td.classList.add('clients__spin');
    td.setAttribute('colspan', '6');
    td.innerHTML = `<svg width='80' height='80' viewBox='0 0 80 80' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M4.00025 40.0005C4.00025 59.8825 20.1182 76.0005 40.0002 76.0005C59.8822 76.0005 76.0002 59.8825 76.0002 40.0005C76.0002 20.1185 59.8823 4.00049 40.0003 4.00049C35.3513 4.00048 30.9082 4.88148 26.8282 6.48648' stroke='#9873FF' stroke-width='8' stroke-miterlimit='10' stroke-linecap='round'/>
      </svg>`;
    tr.append(td);
    tableBody.append(tr);
  }

  spin(tableBody);
  setTimeout(() => {
    getAllClients();
  }, 1000);
}());
