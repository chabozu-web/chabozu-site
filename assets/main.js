(() => {
  const y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  const header = document.querySelector('.header');
  const headerH = () => header?.getBoundingClientRect().height ?? 0;

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerH() - 10;
      window.scrollTo({ top, behavior: 'smooth' });
      history.pushState(null, '', id);
    });
  });

  const form = document.getElementById('contactForm');
  const alertBox = document.getElementById('formAlert');
  const thanks = document.getElementById('thanks');
  const submitBtn = document.getElementById('submitBtn');

  const targets = document.querySelectorAll('.fade-up');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15
  });

  targets.forEach((el) => observer.observe(el));

  if (!form) return;

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

  const showAlert = (messages) => {
    if (!alertBox) return;
    alertBox.hidden = false;
    alertBox.innerHTML = `
      <p><strong>入力内容をご確認ください。</strong></p>
      <ul>${messages.map((m) => `<li>${escapeHtml(m)}</li>`).join('')}</ul>
    `;
  };

  const clearAlert = () => {
    if (!alertBox) return;
    alertBox.hidden = true;
    alertBox.innerHTML = '';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    const hp = form.querySelector('input[name="_gotcha"]');
    if (hp && hp.value) return;

    const name = form.querySelector('input[name="name"]');
    const email = form.querySelector('input[name="email"]');
    const msg = form.querySelector('textarea[name="message"]');

    const errs = [];

    if (!name?.value.trim()) errs.push('お名前を入力してください。');

    if (!email?.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      errs.push('メールアドレスを正しく入力してください。');
    }

    if (!msg?.value.trim()) errs.push('ご相談内容を入力してください。');

    if (errs.length) {
      showAlert(errs);
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '送信中...';
    }

    try {
      const formData = new FormData(form);

      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('送信に失敗しました。');
      }

      form.reset();
      form.hidden = true;
      if (thanks) thanks.hidden = false;
      if (typeof gtag === 'function') {
        gtag('event', 'contact_submit');
      }
    } catch (error) {
      console.error(error);
      showAlert(['送信に失敗しました。時間をおいて再度お試しください。']);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '送信する';
      }
    }
  });
})();
