document.addEventListener('DOMContentLoaded', () => {

    // --- Intro Video Logic ---
    const startOverlay = document.getElementById('start-overlay');
    const btnStartIntro = document.getElementById('btn-start-intro');
    const introVideoContainer = document.getElementById('intro-video-container');
    const introVideo = document.getElementById('intro-video');
    const skipBtn = document.getElementById('skip-intro');
    const appContent = document.getElementById('app-content');

    const startPresentation = () => {
        if (startOverlay) {
            startOverlay.classList.add('fade-out');
            setTimeout(() => startOverlay.remove(), 500);
        }
        if (introVideoContainer) {
            introVideoContainer.style.display = 'flex';
        }
        if (introVideo) {
            introVideo.play().catch(e => {
                console.error("Video play failed:", e);
                endIntro();
            });
        }
    };

    if (btnStartIntro) {
        btnStartIntro.addEventListener('click', startPresentation);
    }

    const endIntro = () => {
        if (introVideoContainer && !introVideoContainer.classList.contains('fade-out')) {
            introVideoContainer.classList.add('fade-out');
            if (appContent) appContent.classList.add('show');
            setTimeout(() => {
                introVideoContainer.remove();
            }, 1000); // 1s matches CSS transition
        }
    };

    if (introVideoContainer && introVideo) {
        introVideo.addEventListener('ended', endIntro);
        if (skipBtn) skipBtn.addEventListener('click', endIntro);
        introVideo.addEventListener('error', endIntro); // Fallback
    } else {
        if (appContent) appContent.classList.add('show');
    }

    // --- Anti-Inspect (F12, Right Click, etc.) ---
    const showWarning = () => {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <span>¡Acceso denegado! Función deshabilitada por seguridad.</span>`;
        
        container.appendChild(toast);
        
        // Trigger reflow to animate
        void toast.offsetWidth;
        toast.classList.add('show');
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400); // Wait for transition
        }, 3000);
    };

    document.addEventListener('contextmenu', event => {
        event.preventDefault();
        showWarning();
    });

    document.addEventListener('keydown', (e) => {
        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            showWarning();
            return false;
        }
        // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
            e.preventDefault();
            showWarning();
            return false;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
            e.preventDefault();
            showWarning();
            return false;
        }
    });

    // --- Stardust Particles Background ---
    const canvas = document.createElement('canvas');
    canvas.id = 'stardust-bg';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-2';
    canvas.style.pointerEvents = 'none';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    const initParticles = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        const count = Math.floor(window.innerWidth / 15);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5 + 0.5,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2 - 0.2,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    };
    
    const drawParticles = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < 0) p.y = canvas.height;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.fill();
        });
        requestAnimationFrame(drawParticles);
    };
    initParticles();
    drawParticles();
    window.addEventListener('resize', initParticles);

    // --- Scroll Animations ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = `fadeInUp 0.8s ease forwards ${entry.target.dataset.delay || '0s'}`;
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .glass-card, .pillar-card, .impact-item, .step').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.dataset.delay = `${(index % 3) * 0.1}s`;

        if (!document.getElementById('scroll-keyframes')) {
            const style = document.createElement('style');
            style.id = 'scroll-keyframes';
            style.innerHTML = `@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }`;
            document.head.appendChild(style);
        }

        observer.observe(el);
    });

    // --- Interactive Spotlight Effect on Cards ---
    document.querySelectorAll('.card, .glass-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // --- Modal Logic ---
    const modal = document.getElementById('login-modal');
    const btnAccess = document.getElementById('btn-leader-access');
    const btnCloseModal = document.querySelector('.close-modal');
    const btnLogin = document.getElementById('btn-login');
    const inputSelect = document.getElementById('leader-select');
    const inputId = document.getElementById('leader-id');
    const errorMsg = document.getElementById('login-error');
    const rouletteArea = document.getElementById('roulette-area');
    const btnExit = document.getElementById('btn-exit');

    const leaderIds = {
        "MARCO ANTONIO PAPA FERNANDEZ": "1689707",
        "JOSE JIMENEZ CHIVIGORRE": "1661088",
        "JESSICA SHANTAL VALENZUELA RUIZ": "1673872",
        "JERIKO AHMED CUTIMANCO ATAO": "1608695"
    };

    let currentLeader = "";

    btnAccess.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    btnCloseModal.addEventListener('click', () => {
        modal.style.display = 'none';
        errorMsg.textContent = '';
        inputSelect.value = '';
        inputId.value = '';
    });

    // --- Audio Logic ---
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playTone(freq = 400, type = 'sine', duration = 0.05, vol = 0.1) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }

    function playTick() { playTone(800, 'square', 0.03, 0.02); }
    function playWin() {
        playTone(440, 'triangle', 0.3, 0.1);
        setTimeout(() => playTone(554, 'triangle', 0.3, 0.1), 100);
        setTimeout(() => playTone(659, 'triangle', 0.5, 0.1), 200);
    }
    function playTimerTick() { playTone(1000, 'sine', 0.1, 0.05); }
    function playTimerEnd() { playTone(300, 'sawtooth', 0.5, 0.2); }
    function playHover() { playTone(1200, 'sine', 0.03, 0.005); }

    // Enlazar sonido hover a elementos interactivos, solo si el contexto está activo
    document.querySelectorAll('.card, .glass-card, .btn-primary, .btn-secondary, .btn-extra').forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (audioCtx.state === 'running') playHover();
        });
    });

    // Iniciar contexto de audio en primer click del usuario
    window.addEventListener('click', () => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }, { once: true });

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    const attemptLogin = () => {
        const selected = inputSelect.value;
        const enteredId = inputId.value.trim();

        if (!selected) {
            errorMsg.textContent = 'Por favor selecciona tu nombre.';
            return;
        }

        if (leaderIds[selected] === enteredId) {
            currentLeader = selected;
            modal.style.display = 'none';
            rouletteArea.classList.remove('hidden');
            rouletteArea.classList.add('roulette-enter');
            setTimeout(() => rouletteArea.classList.remove('roulette-enter'), 600);
            document.body.style.overflow = 'hidden';
            errorMsg.textContent = '';
            inputId.value = '';
        } else {
            errorMsg.textContent = 'El ID no es correcto para el líder seleccionado.';
            inputId.classList.add('shake');
            setTimeout(() => inputId.classList.remove('shake'), 400);
        }
    };

    btnLogin.addEventListener('click', attemptLogin);
    inputId.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });

    btnExit.addEventListener('click', () => {
        rouletteArea.classList.add('hidden');
        document.body.style.overflow = 'auto';
        resetTimer();
        document.getElementById('timer-area').classList.add('hidden');
        document.getElementById('response-form-area').classList.add('hidden');
    });

    // --- Roulette Logic ---
    const topics = [
        { title: "Autoconciencia",     desc: "Evalúa cómo identificarías tus emociones en una situación de alta presión.",                                            color: "#7c3aed" },
        { title: "Autorregulación",    desc: "Plantea cómo manejarías un impulso negativo tras recibir una crítica injusta.",                                         color: "#0ea5e9" },
        { title: "Motivación",         desc: "Debate sobre cómo mantener el enfoque y la energía cuando un proyecto fracasa.",                                        color: "#f59e0b" },
        { title: "Empatía",            desc: "Discute cómo abordarías a un compañero de equipo que está pasando por un mal momento personal.",                        color: "#10b981" },
        { title: "Habilidades Sociales", desc: "Ejemplifica cómo construirías redes de apoyo dentro de un nuevo entorno laboral.",                                    color: "#ef4444" }
    ];

    const wheel = document.getElementById('wheel');
    const btnSpin = document.getElementById('btn-spin');
    const timerArea = document.getElementById('timer-area');
    const resultTopic = document.getElementById('result-topic');
    const resultDesc = document.getElementById('result-desc');

    let currentRotation = 0;
    let isSpinning = false;
    const slices = topics.length;
    const sliceAngle = 360 / slices;
    let usedTopics = JSON.parse(localStorage.getItem('ie_used_topics')) || [];

    function getAvailableTopics() {
        const available = topics.filter(t => !usedTopics.includes(t.title));
        return available.length > 0 ? available : topics; // reset if all used
    }

    function markTopicUsed(title) {
        if (!usedTopics.includes(title)) {
            usedTopics.push(title);
            localStorage.setItem('ie_used_topics', JSON.stringify(usedTopics));
        }
    }

    function updateSpinButton() {
        const allUsed = usedTopics.length >= topics.length;
        btnSpin.textContent = allUsed ? '🔄 TODOS USADOS — REINICIAR RULETA' : 'GIRAR LA RULETA';
    }

    function updateUsedBadges() {
        document.querySelectorAll('.topic-badge').forEach(badge => {
            if (usedTopics.includes(badge.dataset.topic)) {
                badge.classList.add('used');
            }
        });
        updateResponseCounter();
    }

    // Draw wheel slices
    topics.forEach((topic, i) => {
        const slice = document.createElement('div');
        slice.className = 'slice';
        const skewY = 90 - sliceAngle;
        slice.style.transform = `rotate(${i * sliceAngle}deg) skewY(${skewY}deg)`;
        slice.style.backgroundColor = topic.color;

        const text = document.createElement('div');
        text.className = 'slice-text';
        text.style.transform = `skewY(${-skewY}deg) rotate(${sliceAngle / 2}deg) translateY(-120px)`;
        text.textContent = topic.title;

        slice.appendChild(text);
        wheel.appendChild(slice);
    });

    btnSpin.addEventListener('click', () => {
        if (isSpinning) return;
        isSpinning = true;

        // Hide previous timer/result/form
        timerArea.classList.add('hidden');
        document.getElementById('response-form-area').classList.add('hidden');
        resetTimer();

        // Spin logic — only land on available (unused) topics
        const available = getAvailableTopics();
        const targetTopic = available[Math.floor(Math.random() * available.length)];
        const targetIndex = topics.findIndex(t => t.title === targetTopic.title);

        const spins = 5 + Math.floor(Math.random() * 5);
        const targetDeg = 360 - (targetIndex * sliceAngle) - (sliceAngle / 2);
        const totalRotation = currentRotation + (spins * 360) + targetDeg - (currentRotation % 360);

        wheel.style.transform = `rotate(${totalRotation}deg)`;
        currentRotation = totalRotation;
        wheel.classList.add('spinning');

        // Ticking sound — fast then slowing down
        let tickInterval = setInterval(playTick, 150);
        setTimeout(() => {
            clearInterval(tickInterval);
            tickInterval = setInterval(playTick, 400);
        }, 2000);

        // Show result after spin finishes (3.5s matches CSS transition)
        setTimeout(() => {
            clearInterval(tickInterval);
            playWin();
            wheel.classList.remove('spinning');
            markTopicUsed(targetTopic.title);
            updateUsedBadges();
            resultTopic.textContent = targetTopic.title;
            resultDesc.textContent = targetTopic.desc;
            timerArea.classList.remove('hidden');

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ffffff', '#aaaaaa', '#555555']
            });

            isSpinning = false;
            updateSpinButton();
        }, 3500);
    });

    updateSpinButton();
    updateUsedBadges();

    // --- Timer Logic ---
    const timeDisplay = document.getElementById('time-display');
    const timerProgress = document.getElementById('timer-progress');
    const btnStartTimer = document.getElementById('btn-start-timer');
    const btnResetTimer = document.getElementById('btn-reset-timer');

    const totalTime = 3 * 60;
    let timeRemaining = totalTime;
    let timerInterval = null;
    let timerRunning = false;

    function updateTimeDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const percentage = (timeRemaining / totalTime) * 100;
        if (timerProgress) {
            timerProgress.style.width = `${percentage}%`;
            if (timeRemaining <= 30) {
                timerProgress.classList.add('danger');
            } else {
                timerProgress.classList.remove('danger');
            }
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timeRemaining = totalTime;
        timerRunning = false;
        btnStartTimer.textContent = 'Iniciar Debate';
        updateTimeDisplay();
        timeDisplay.style.color = '#fff';
    }

    btnStartTimer.addEventListener('click', () => {
        if (timerRunning) {
            clearInterval(timerInterval);
            timerRunning = false;
            btnStartTimer.textContent = 'Reanudar';
        } else {
            timerRunning = true;
            btnStartTimer.textContent = 'Pausar';

            timerInterval = setInterval(() => {
                timeRemaining--;
                updateTimeDisplay();

                if (timeRemaining <= 60) {
                    timeDisplay.style.color = '#ffaa00';
                }
                if (timeRemaining <= 10 && timeRemaining > 0) {
                    timeDisplay.style.color = '#ff5555';
                    playTimerTick();
                }
                if (timeRemaining <= 0) {
                    clearInterval(timerInterval);
                    timerRunning = false;
                    timeDisplay.style.color = '#ff5555';
                    btnStartTimer.textContent = 'Tiempo Terminado';
                    btnStartTimer.disabled = true;
                    playTimerEnd();
                    confetti({
                        particleCount: 50,
                        spread: 60,
                        origin: { y: 0.8 },
                        colors: ['#ff0000']
                    });
                    document.getElementById('response-form-area').classList.remove('hidden');
                }
            }, 1000);
        }
    });

    btnResetTimer.addEventListener('click', () => {
        resetTimer();
        btnStartTimer.disabled = false;
        document.getElementById('response-form-area').classList.add('hidden');
    });

    document.getElementById('btn-extra-time').addEventListener('click', () => {
        timeRemaining += 60;
        updateTimeDisplay();
        if (btnStartTimer.disabled) {
            btnStartTimer.disabled = false;
            btnStartTimer.textContent = 'Reanudar';
            timeDisplay.style.color = '#fff';
        }
        timeDisplay.style.transform = 'scale(1.15)';
        setTimeout(() => timeDisplay.style.transform = 'scale(1)', 200);
    });

    // --- Responses Logic ---
    const btnSubmitResponse = document.getElementById('btn-submit-response');
    const responseText = document.getElementById('leader-response-text');
    const responsesGrid = document.getElementById('responses-grid');

    function renderResponses() {
        responsesGrid.innerHTML = '';
        const savedResponses = JSON.parse(localStorage.getItem('ie_responses')) || [];

        if (savedResponses.length === 0) {
            responsesGrid.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">Aún no hay respuestas registradas. Realiza la dinámica para verlas aquí.</p>';
            return;
        }

        savedResponses.forEach(res => {
            const card = document.createElement('div');
            card.className = 'card response-card animate-up';
            card.innerHTML = `
                <h4>${res.leader}</h4>
                <div class="topic">Tema: ${res.topic}</div>
                <p>${res.text}</p>
            `;
            responsesGrid.appendChild(card);
        });
    }

    btnSubmitResponse.addEventListener('click', () => {
        const text = responseText.value.trim();
        if (!text) {
            alert('Por favor, escribe una respuesta antes de publicar.');
            return;
        }

        const newResponse = {
            leader: currentLeader,
            topic: resultTopic.textContent,
            text: text
        };

        const savedResponses = JSON.parse(localStorage.getItem('ie_responses')) || [];
        savedResponses.push(newResponse);
        localStorage.setItem('ie_responses', JSON.stringify(savedResponses));

        renderResponses();
        responseText.value = '';
        document.getElementById('response-form-area').classList.add('hidden');
        rouletteArea.classList.add('hidden');
        document.body.style.overflow = 'auto';
        resetTimer();
        document.getElementById('timer-area').classList.add('hidden');
        updateResponseCounter();

        setTimeout(() => {
            document.getElementById('respuestas-section').scrollIntoView({ behavior: 'smooth' });
        }, 100);
    });

    // --- Counter Logic ---
    function updateResponseCounter() {
        const savedResponses = JSON.parse(localStorage.getItem('ie_responses')) || [];
        const count = savedResponses.length;
        const total = 4;
        const counterEl = document.getElementById('response-counter');
        const counterBar = document.getElementById('counter-progress');
        const counterText = document.getElementById('counter-text');
        if (!counterEl) return;
        counterEl.style.display = 'block';
        const pct = Math.min((count / total) * 100, 100);
        counterBar.style.width = `${pct}%`;
        counterText.textContent = `${count} de ${total} grupos han respondido`;
        if (count >= total) {
            counterEl.classList.add('complete');
            counterText.textContent = '✅ ¡Todos los grupos han respondido!';
        } else {
            counterEl.classList.remove('complete');
        }
    }

    // Initial render
    renderResponses();
    updateResponseCounter();

    // --- Clean Wall Button ---
    const btnClearWall = document.getElementById('btn-clear-wall');
    if (btnClearWall) {
        btnClearWall.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas borrar TODAS las respuestas y reiniciar los temas de la ruleta?')) {
                localStorage.removeItem('ie_responses');
                localStorage.removeItem('ie_used_topics');
                usedTopics = [];
                renderResponses();
                updateResponseCounter();
                updateUsedBadges();
                updateSpinButton();
                document.querySelectorAll('.topic-badge').forEach(b => b.classList.remove('used'));
            }
        });
    }

}); // END DOMContentLoaded
