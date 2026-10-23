(() => {
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const form = document.querySelector('#quote-form');
  const status = document.querySelector('#form-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const syncHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
    nav.classList.remove('open');
    document.body.classList.remove('menu-open');
  };
  menuButton.addEventListener('click', () => {
    const opening = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('open', opening);
    document.body.classList.toggle('menu-open', opening);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 700) closeMenu(); });

  document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
    const select = form.elements.servico;
    select.value = link.dataset.service;
  }));

  document.querySelector('#year').textContent = new Date().getFullYear();

  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
  } else {
    document.querySelectorAll('[data-reveal]').forEach(element => element.classList.add('revealed'));
  }

  const messages = {
    nome: 'Indica o teu nome (pelo menos 2 caracteres).',
    email: 'Introduz um endereço de email válido.',
    telefone: 'Indica um número de telefone válido.',
    veiculo: 'Indica a marca e o modelo do automóvel.',
    ano: 'Indica um ano entre 1900 e 2099.',
    servico: 'Seleciona o serviço pretendido.',
    mensagem: 'Descreve o pedido com pelo menos 10 caracteres.'
  };
  const validateField = field => {
    if (!field.name || field.type === 'radio' || field.type === 'checkbox') return true;
    const error = field.closest('label')?.querySelector('.error');
    let message = '';
    if (field.name === 'ano' && field.value && !/^(19|20)\d{2}$/.test(field.value)) message = messages.ano;
    else if (!field.checkValidity()) message = messages[field.name] || 'Verifica este campo.';
    field.classList.toggle('invalid', Boolean(message));
    if (error) error.textContent = message;
    return !message;
  };
  form.querySelectorAll('input:not([type=radio]):not([type=checkbox]),select,textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => { if (field.classList.contains('invalid')) validateField(field); });
    field.addEventListener('change', () => validateField(field));
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = [...form.querySelectorAll('input:not([type=radio]):not([type=checkbox]),select,textarea')];
    const fieldsValid = fields.map(validateField).every(Boolean);
    const contactError = form.querySelector('fieldset .error');
    const consentError = form.querySelector('.consent-error');
    const contactChosen = Boolean(form.querySelector('input[name="contacto"]:checked'));
    const consentChosen = form.elements.privacidade.checked;
    if (contactError) contactError.textContent = contactChosen ? '' : 'Seleciona o método de contacto preferido.';
    if (consentError) consentError.textContent = consentChosen ? '' : 'É necessário confirmar que compreendes o caráter demonstrativo.';
    if (!fieldsValid || !contactChosen || !consentChosen) {
      status.textContent = 'Revê os campos assinalados para continuares.';
      status.classList.remove('success');
      form.querySelector('.invalid')?.focus();
      return;
    }
    status.textContent = 'Pedido demonstrativo preparado. Nada foi enviado nem guardado; este formulário precisa de integração com um serviço real.';
    status.classList.add('success');
  });
})();
