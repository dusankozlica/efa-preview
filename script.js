/* ============================================
   EVOLUTION FOOTBALL ACADEMY
   Ball cursor · Accordion · Countdown · Counter
   ============================================ */

(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const isTouch = matchMedia('(hover: none)').matches || window.innerWidth < 900;
  const lerp = (a, b, t) => a + (b - a) * t;

  // ============================================
  // CUSTOM BALL CURSOR (small → big on hover)
  // ============================================
  const cursor = $('.cursor');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;
  if (!isTouch && cursor) {
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    const raf = () => {
      cx = lerp(cx, mx, 0.22);
      cy = lerp(cy, my, 0.22);
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(raf);
    };
    raf();

    // Default link hover — small accent ball
    $$('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-link'));
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-link');
        cursor.classList.remove('is-big');
      });
    });

    // Big-state: bars, philo cards, addresses, standort cards, portraits, staff cards
    $$('.acc__head, .philo__card, .standort__card, .acc__media, .portrait, .staff__card').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-big'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-big'));
    });

    // Invert cursor color over orange-filled elements (orange-on-orange = invisible).
    // Only the accordion HEAD turns orange, not the whole row.
    $$('.acc__head, .camp__btn, .standort__map-link').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-invert'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-invert'));
    });

    // Dark-state: cursor needs to be DARK over cream/light surfaces
    // (cream Probetraining pill, "Programme entdecken", "Termin anfragen" CTAs,
    //  the cream marquee strip). Add a class that flips cursor to dark ink.
    $$('.bar__cta, .hero__btn, .acc__cta, .strip').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-dark'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-dark'));
    });
  }

  // ============================================
  // TOP BAR scroll state + burger
  // ============================================
  const bar = $('#bar');
  const brandEl = $('#brand');
  const onScroll = () => {
    const isScrolled = window.scrollY > 30;
    bar.classList.toggle('scrolled', isScrolled);
    brandEl?.classList.toggle('scrolled', isScrolled);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('#burger');
  const nav = $('.bar__nav');
  burger?.addEventListener('click', () => {
    burger.classList.toggle('open');
    nav.classList.toggle('open');
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open');
    nav.classList.remove('open');
  }));

  // ============================================
  // ACCORDION (full-width bars)
  // Click a bar → opens that one, closes others
  // ============================================
  const rows = $$('.acc__row');
  rows.forEach(row => {
    const head = row.querySelector('.acc__head');
    head?.addEventListener('click', () => {
      const isOpen = row.dataset.open === 'true';
      // Close all
      rows.forEach(r => {
        r.dataset.open = 'false';
        r.querySelector('.acc__head')?.setAttribute('aria-expanded', 'false');
      });
      // Toggle current (open if was closed)
      if (!isOpen) {
        row.dataset.open = 'true';
        head.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ============================================
  // COUNT-UP STATS
  // ============================================
  const animateCount = el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1800;
    const start = performance.now();
    const tick = now => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(target * eased) + (t === 1 ? suffix : '');
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(tick);
  };
  const countObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCount(e.target);
        countObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  $$('[data-count]').forEach(el => countObs.observe(el));

  // ============================================
  // COUNTDOWN to camp (27 Jul 2026) — main section + floating popup
  // ============================================
  const target = new Date('2026-07-27T08:30:00+02:00').getTime();
  const $d = $('#cd-days'), $h = $('#cd-hours'), $m = $('#cd-min'), $s = $('#cd-sec');
  const $cpd = $('#cp-d'), $cph = $('#cp-h'), $cpm = $('#cp-m');
  const $cpbDays = $('#cpb-days');
  const pad = n => String(Math.max(0, n)).padStart(2, '0');
  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      if ($d) $d.textContent = $h.textContent = $m.textContent = $s.textContent = '00';
      if ($cpd) $cpd.textContent = $cph.textContent = $cpm.textContent = '00';
      return;
    }
    const dd = pad(Math.floor(diff / 864e5));
    const hh = pad(Math.floor((diff / 36e5) % 24));
    const mm = pad(Math.floor((diff / 6e4) % 60));
    const ss = pad(Math.floor((diff / 1e3) % 60));
    if ($d) { $d.textContent = dd; $h.textContent = hh; $m.textContent = mm; $s.textContent = ss; }
    if ($cpd) { $cpd.textContent = dd; $cph.textContent = hh; $cpm.textContent = mm; }
    if ($cpbDays) { $cpbDays.textContent = String(Math.floor(diff / 864e5)); }
  };
  if ($d || $cpd) { tick(); setInterval(tick, 1000); }

  // ============================================
  // FLOATING CAMP POPUP — am Start offen, schliesst beim Verlassen vom Hero
  // → Popup wird einklappt, Mini-Bubble bleibt als Re-Opener sichtbar
  // ============================================
  const campop = $('#campop');
  const campopClose = $('#campop-close');
  const campopBubble = $('#campop-bubble');
  if (campop) {
    // Popup zuklappen, Mini-Bubble einblenden (gleich für X-Klick & Scroll)
    const closeCampop = () => {
      campop.classList.add('is-hidden');
      setTimeout(() => { if (campopBubble) campopBubble.hidden = false; }, 250);
      sessionStorage.setItem('campop-dismissed', '1');
    };

    // Bei vorherigem Dismiss in derselben Session → direkt im Bubble-State starten
    if (sessionStorage.getItem('campop-dismissed') === '1') {
      campop.classList.add('is-hidden');
      if (campopBubble) campopBubble.hidden = false;
    }

    // X-Klick & "Mehr"-Klick → Popup zu, Bubble erscheint
    campopClose?.addEventListener('click', closeCampop);
    $('.campop__more')?.addEventListener('click', closeCampop);

    // Bubble-Klick → Popup wieder öffnen
    campopBubble?.addEventListener('click', () => {
      campopBubble.hidden = true;
      campop.classList.remove('is-hidden');
      sessionStorage.removeItem('campop-dismissed');
    });

    // Auto-close beim Verlassen vom Hero (gleiche Action wie X-Klick)
    if (sessionStorage.getItem('campop-dismissed') !== '1') {
      const hero = $('.hero');
      const getThreshold = () => {
        if (hero) return hero.offsetTop + hero.offsetHeight - 80;
        return window.innerHeight - 80;
      };
      let threshold = getThreshold();
      window.addEventListener('resize', () => { threshold = getThreshold(); }, { passive: true });

      const onScrollClose = () => {
        if (window.scrollY > threshold) {
          closeCampop();
          window.removeEventListener('scroll', onScrollClose);
        }
      };
      window.addEventListener('scroll', onScrollClose, { passive: true });
    }
  }

  // ============================================
  // YEAR + SMOOTH SCROLL
  // ============================================
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = $(id);
      if (!t) return;
      e.preventDefault();
      const y = t.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  // ============================================
  // HERO video parallax
  // ============================================
  const heroVid = $('.hero__video');
  if (heroVid) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroVid.style.transform = `translateY(${y * 0.25}px) scale(1.05)`;
      }
    }, { passive: true });
  }

  // Video fallback
  $$('video').forEach(v => {
    v.addEventListener('error', () => v.style.display = 'none');
  });

  // ============================================
  // PROBETRAINING WIZARD
  // ============================================
  const probe = $('#probe');
  if (probe) {
    const state = { step: 1, age: null, position: null, date: null, time: null };
    const totalSteps = 4;

    const $step = (n) => probe.querySelector(`.probe__step[data-step="${n}"]`);
    const $dots = $$('.probe__progress-dot', probe);
    const $back = $('#probe-back', probe);
    const $next = $('#probe-next', probe);
    const $cur = $('#probe-cur', probe);
    const $head = $('.probe__heading', probe);

    const headings = {
      1: 'Lass uns dich kennenlernen.',
      2: 'Wo fühlst du dich wohl?',
      3: 'Such dir deinen Termin.',
      4: 'Fast geschafft — letzter Schritt.',
      done: 'Wir freuen uns auf dich!',
    };

    const openWizard = () => {
      probe.classList.add('is-open');
      probe.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const closeWizard = () => {
      probe.classList.remove('is-open');
      probe.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    // Open triggers — alle Elemente mit [data-open-probe]
    // (Bar-Button, alle Leistungen-Akkordeon-CTAs, Preise-Closer-CTA, ...)
    $$('[data-open-probe]').forEach(el => el.addEventListener('click', (e) => {
      // Verhindert Navigation zu #kontakt bei <a>-Tags
      e.preventDefault();
      openWizard();
    }));
    // Close triggers
    $$('[data-probe-close]', probe).forEach(el => el.addEventListener('click', (e) => {
      e.preventDefault();
      closeWizard();
    }));
    // Esc-Taste
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && probe.classList.contains('is-open')) closeWizard();
    });

    // Render current step
    const renderStep = (s) => {
      $$('.probe__step', probe).forEach(el => el.classList.remove('is-active'));
      const target = s === 'done' ? probe.querySelector('.probe__step--done') : $step(s);
      target?.classList.add('is-active');
      $cur.textContent = s === 'done' ? '✓' : s;
      $head.textContent = headings[s] || headings[1];

      // Progress dots
      $dots.forEach((d, i) => {
        d.classList.remove('is-active', 'is-done');
        if (s === 'done') { d.classList.add('is-done'); return; }
        const n = i + 1;
        if (n < s) d.classList.add('is-done');
        if (n === s) d.classList.add('is-active');
      });

      // Nav state
      if (s === 'done') {
        $back.style.display = 'none';
        $next.style.display = 'none';
        probe.querySelector('.probe__nav').style.display = 'none';
      } else {
        $back.style.display = '';
        $next.style.display = '';
        probe.querySelector('.probe__nav').style.display = '';
        $back.disabled = (s === 1);
        $next.disabled = !stepValid(s);
        $next.textContent = (s === totalSteps) ? 'Absenden ✓' : 'Weiter →';
      }
    };

    const stepValid = (s) => {
      if (s === 1) return !!state.age;
      if (s === 2) return !!state.position;
      if (s === 3) return !!(state.date && state.time);
      if (s === 4) {
        const name = $('#probe-name').value.trim();
        const email = $('#probe-email').value.trim();
        return name.length > 1 && /.+@.+\..+/.test(email);
      }
      return false;
    };

    // Chip selection (steps 1, 2)
    $$('.probe__chips[data-field] .probe__chip', probe).forEach(chip => {
      chip.addEventListener('click', () => {
        const field = chip.parentElement.dataset.field;
        chip.parentElement.querySelectorAll('.probe__chip').forEach(c => c.classList.remove('is-selected'));
        chip.classList.add('is-selected');
        state[field] = chip.dataset.val;
        $next.disabled = !stepValid(state.step);
      });
    });

    // Date grid generator
    const datesEl = $('#probe-dates', probe);
    const timesEl = $('#probe-times', probe);
    const dayShort = ['SO','MO','DI','MI','DO','FR','SA'];
    const monthShort = ['JAN','FEB','MÄR','APR','MAI','JUN','JUL','AUG','SEP','OKT','NOV','DEZ'];
    const buildDates = () => {
      datesEl.innerHTML = '';
      const today = new Date();
      let added = 0, offset = 1;
      while (added < 12) {
        const d = new Date(today);
        d.setDate(today.getDate() + offset);
        offset++;
        if (d.getDay() === 0) continue; // Sonntag überspringen
        const iso = d.toISOString().slice(0,10);
        const btn = document.createElement('button');
        btn.className = 'probe__date';
        btn.dataset.val = iso;
        btn.innerHTML = `
          <span class="probe__date-day">${dayShort[d.getDay()]}</span>
          <span class="probe__date-num">${d.getDate()}</span>
          <span class="probe__date-month">${monthShort[d.getMonth()]}</span>
        `;
        btn.addEventListener('click', () => {
          datesEl.querySelectorAll('.probe__date').forEach(b => b.classList.remove('is-selected'));
          btn.classList.add('is-selected');
          state.date = iso;
          timesEl.hidden = false;
          $next.disabled = !stepValid(state.step);
        });
        datesEl.appendChild(btn);
        added++;
      }
    };
    buildDates();

    // Time chip selection
    timesEl.querySelectorAll('.probe__chip').forEach(c => {
      c.addEventListener('click', () => {
        timesEl.querySelectorAll('.probe__chip').forEach(x => x.classList.remove('is-selected'));
        c.classList.add('is-selected');
        state.time = c.dataset.val;
        $next.disabled = !stepValid(state.step);
      });
    });

    // Form input listener (step 4)
    ['probe-name','probe-email','probe-phone','probe-note'].forEach(id => {
      $('#'+id)?.addEventListener('input', () => {
        $next.disabled = !stepValid(state.step);
      });
    });

    // Nav handlers
    $back.addEventListener('click', () => {
      if (state.step > 1) { state.step--; renderStep(state.step); }
    });
    $next.addEventListener('click', () => {
      if (!stepValid(state.step)) return;
      if (state.step < totalSteps) { state.step++; renderStep(state.step); }
      else {
        // Submit — Mailto öffnen mit allen Daten (sicheres "no backend"-Setup)
        const name = $('#probe-name').value.trim();
        const email = $('#probe-email').value.trim();
        const phone = $('#probe-phone').value.trim();
        const note = $('#probe-note').value.trim();
        const subject = encodeURIComponent('Probetraining-Anfrage');
        const body = encodeURIComponent(
          `Hallo Evolution Football Academy,\n\n` +
          `ich möchte ein Probetraining buchen:\n\n` +
          `Name: ${name}\n` +
          `Alter: ${state.age}\n` +
          `Position: ${state.position}\n` +
          `Wunschtermin: ${state.date} um ${state.time} Uhr\n` +
          `E-Mail: ${email}\n` +
          `Telefon: ${phone || '—'}\n` +
          `Nachricht: ${note || '—'}\n\n` +
          `Vielen Dank!`
        );
        window.location.href = `mailto:info@evolution-football-academy.ch?subject=${subject}&body=${body}`;
        state.step = 'done';
        renderStep('done');
      }
    });

    renderStep(1);
  }
})();
