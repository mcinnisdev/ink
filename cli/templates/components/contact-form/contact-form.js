(function() {
  document.querySelectorAll('form.form[action]').forEach(function(form) {
    if (form.getAttribute('action') === '#') return;
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var status = form.querySelector('.form__status');
      var btn = form.querySelector('[type="submit"]');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      
      btn.disabled = true;
      btn.textContent = 'Sending...';
      
      fetch(form.action, {
        method: form.method || 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
      .then(function(res) {
        if (res.ok) {
          if (status) {
            status.hidden = false;
            status.className = 'form__status form__status--success';
            status.textContent = 'Thank you! Your message has been sent.';
          }
          form.reset();
        } else {
          throw new Error('Submission failed');
        }
      })
      .catch(function() {
        if (status) {
          status.hidden = false;
          status.className = 'form__status form__status--error';
          status.textContent = 'Something went wrong. Please try again.';
        }
      })
      .finally(function() {
        btn.disabled = false;
        btn.textContent = 'Send Message';
      });
    });
  });
})();
