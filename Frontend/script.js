// Configure your API URL here
// Replace 'https://your-backend-name.onrender.com' with your actual Render deployment URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://decision-log-system.onrender.com'; // <--- Live Render API URL

document.addEventListener('DOMContentLoaded', () => {
    const API = 'http://localhost:3000/api';

    // ── Page Elements ────────────────────────────────────────────────────────
    const loginPage   = document.getElementById('login-page');
    const signupPage  = document.getElementById('signup-page');
    const mainApp     = document.getElementById('main-app');

    // Login
    const loginBtn      = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username');
    const loginError    = document.getElementById('login-error');
    const welcomeText   = document.getElementById('welcome-text');

    // Signup
    const toSignupLink       = document.getElementById('to-signup-link');
    const toLoginLink        = document.getElementById('to-login-link');
    const signupBtn          = document.getElementById('signup-btn');
    const signupBackBtn      = document.getElementById('signup-back-btn');
    const signupNameInput    = document.getElementById('signup-name');
    const signupContactInput = document.getElementById('signup-contact');
    const signupNameError    = document.getElementById('signup-name-error');
    const signupContactError = document.getElementById('signup-contact-error');
    const signupCountryCode  = document.getElementById('country-code');

    // App
    const form                = document.getElementById('decision-form');
    const decisionListContainer = document.getElementById('decision-list');
    const decisionListTitle   = document.getElementById('decision-list-title');
    const problemInput        = document.getElementById('problem');
    const alternativesInput   = document.getElementById('alternatives');
    const finalDecisionInput  = document.getElementById('final-decision');
    const problemError        = document.getElementById('problem-error');
    const alternativesError   = document.getElementById('alternatives-error');
    const finalDecisionError  = document.getElementById('final-decision-error');
    const formGeneralError    = document.getElementById('form-general-error');
    const mainBackBtn         = document.getElementById('main-back-btn');
    const logoutBtn           = document.getElementById('logout-btn');

    // View Toggle
    const myDecisionsBtn  = document.getElementById('my-decisions-btn');
    const allDecisionsBtn = document.getElementById('all-decisions-btn');

    let currentView = 'my'; // 'my' or 'all'

    // ── Navigation Logic ──────────────────────────────────────────────────────

    if (toSignupLink) {
        toSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginPage.style.display = 'none';
            signupPage.style.display = 'flex';
        });
    }

    if (toLoginLink) {
        toLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            signupPage.style.display = 'none';
            loginPage.style.display = 'flex';
        });
    }

    if (signupBackBtn) {
        signupBackBtn.addEventListener('click', () => {
            signupPage.style.display = 'none';
            loginPage.style.display = 'flex';
            signupNameInput.value = '';
            signupContactInput.value = '';
            signupNameError.style.display = 'none';
            signupContactError.style.display = 'none';
            signupCountryCode.value = '91';
        });
    }

    if (signupContactInput) {
        signupContactInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }

    if (mainBackBtn) {
        mainBackBtn.addEventListener('click', () => {
            mainApp.style.display = 'none';
            loginPage.style.display = 'flex';
            document.body.classList.remove('main-ui-bg');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('decisionLogUserName');
            mainApp.style.display = 'none';
            loginPage.style.display = 'flex';
            usernameInput.value = '';
            loginError.style.display = 'none';
            document.body.classList.remove('main-ui-bg');
        });
    }

    // ── View Toggle ───────────────────────────────────────────────────────────

    if (myDecisionsBtn) {
        myDecisionsBtn.addEventListener('click', () => {
            currentView = 'my';
            myDecisionsBtn.classList.add('active');
            allDecisionsBtn.classList.remove('active');
            decisionListTitle.textContent = 'My Decisions';
            const userName = localStorage.getItem('decisionLogUserName');
            if (userName) loadDecisions(userName, 'my');
        });
    }

    if (allDecisionsBtn) {
        allDecisionsBtn.addEventListener('click', () => {
            currentView = 'all';
            allDecisionsBtn.classList.add('active');
            myDecisionsBtn.classList.remove('active');
            decisionListTitle.textContent = 'All Team Decisions';
            const userName = localStorage.getItem('decisionLogUserName');
            if (userName) loadDecisions(userName, 'all');
        });
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    const handleLogin = async () => {
        const userName = usernameInput.value.trim();

        if (!userName) {
            loginError.textContent = "Name is required";
            loginError.style.display = 'block';
        } else if (!/^[A-Za-z\s]+$/.test(userName)) {
            loginError.textContent = "Only alphabets are allowed";
            loginError.style.display = 'block';
        } else {
            try {
                const response = await fetch(`${API_BASE_URL}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: userName })
                });
                const data = await response.json();

                if (!response.ok) {
                    loginError.textContent = data.error || "Login failed";
                    loginError.style.display = 'block';
                    return;
                }

                loginError.style.display = 'none';
                localStorage.setItem('decisionLogUserName', userName);

                loginPage.style.display = 'none';
                signupPage.style.display = 'none';
                mainApp.style.display = 'block';
                document.body.classList.add('main-ui-bg');

                welcomeText.textContent = `Welcome, ${userName}`;

                // Reset to "My Decisions" view on login
                currentView = 'my';
                myDecisionsBtn.classList.add('active');
                allDecisionsBtn.classList.remove('active');
                decisionListTitle.textContent = 'My Decisions';

                loadDecisions(userName, 'my');
            } catch (err) {
                console.error(err);
                loginError.textContent = "Server error. Please make sure backend is running.";
                loginError.style.display = 'block';
            }
        }
    };

    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (usernameInput) {
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleLogin(); }
        });
    }

    // ── Signup ────────────────────────────────────────────────────────────────

    if (signupBtn) {
        signupBtn.addEventListener('click', async () => {
            let valid = true;
            const nameVal    = signupNameInput.value.trim();
            const contactVal = signupContactInput.value.trim();
            const countryCode = signupCountryCode.value;

            if (!nameVal) {
                signupNameError.textContent = "Name is required";
                signupNameError.style.display = 'block';
                valid = false;
            } else if (!/^[A-Za-z\s]+$/.test(nameVal)) {
                signupNameError.textContent = "Only alphabets are allowed";
                signupNameError.style.display = 'block';
                valid = false;
            } else {
                signupNameError.style.display = 'none';
            }

            const fullContact = `+${countryCode}${contactVal}`;
            if (!contactVal) {
                signupContactError.textContent = "Contact number is required";
                signupContactError.style.display = 'flex';
                valid = false;
            } else if (countryCode === '91' && contactVal.length !== 10) {
                signupContactError.textContent = "Contact number must be exactly 10 digits";
                signupContactError.style.display = 'flex';
                valid = false;
            } else if (countryCode !== '91' && (contactVal.length < 8 || contactVal.length > 15)) {
                signupContactError.textContent = "Enter a valid phone number (8-15 digits)";
                signupContactError.style.display = 'flex';
                valid = false;
            } else {
                signupContactError.style.display = 'none';
            }

            if (valid) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/signup`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: nameVal, contact: fullContact })
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        signupNameError.textContent = data.error || "Signup failed";
                        signupNameError.style.display = 'block';
                        return;
                    }
                    alert('Signup Successful! You can now login.');
                    signupNameInput.value = '';
                    signupContactInput.value = '';
                    signupPage.style.display = 'none';
                    loginPage.style.display = 'flex';
                } catch (err) {
                    console.error(err);
                    signupNameError.textContent = "Server error. Please make sure backend is running.";
                    signupNameError.style.display = 'block';
                }
            }
        });
    }

    // ── Load Decisions ────────────────────────────────────────────────────────

    const loadDecisions = async (username, view = 'my') => {
        decisionListContainer.innerHTML = '<p class="loading-text">Loading decisions...</p>';
        try {
            const url = view === 'all'
                ? `${API_BASE_URL}/api/decisions`
                : `${API_BASE_URL}/api/decisions/${username}`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                decisionListContainer.innerHTML = '';

                if (data.length === 0) {
                    decisionListContainer.innerHTML = '<p class="empty-text">No decisions found. Be the first to log one!</p>';
                    return;
                }

                data.forEach(decision => {
                    const cardElement = createDecisionCard(decision, username);
                    decisionListContainer.appendChild(cardElement);
                });
            }
        } catch (err) {
            console.error('Failed to fetch decisions', err);
            decisionListContainer.innerHTML = '<p class="empty-text">Could not load decisions. Is the server running?</p>';
        }
    };

    // ── Create Decision Card ──────────────────────────────────────────────────

    const createDecisionCard = (decision, currentUser) => {
        const card = document.createElement('div');
        card.classList.add('decision-card');
        card.dataset.id = decision.id;

        const dateStr = decision.timestamp
            ? new Date(decision.timestamp).toLocaleString()
            : 'Unknown time';

        card.innerHTML = `
            <div class="card-header">
                <h3>📋 Decision</h3>
                <span class="card-meta">by <strong>${escapeHTML(decision.username)}</strong> &bull; ${dateStr}</span>
            </div>

            <div class="field">
                <div class="label">Problem</div>
                <div class="value">${escapeHTML(decision.problem)}</div>
            </div>

            <div class="field">
                <div class="label">Alternatives Considered</div>
                <div class="value">${escapeHTML(decision.alternatives)}</div>
            </div>

            <div class="field">
                <div class="label">Final Decision</div>
                <div class="value">${escapeHTML(decision.finalDecision)}</div>
            </div>

            <!-- Revisions -->
            <div class="revisions-section">
                <div class="section-toggle" data-target="revisions-${decision.id}">
                    💡 Revision Suggestions <span class="revision-count">(${(decision.revisions || []).length})</span>
                    <span class="toggle-icon">▼</span>
                </div>
                <div class="collapsible" id="revisions-${decision.id}">
                    <div class="revisions-list">
                        ${(decision.revisions || []).map(r => `
                            <div class="revision-item">
                                <span class="revision-user">🔄 ${escapeHTML(r.revisedBy)}</span>
                                <p>${escapeHTML(r.suggestion)}</p>
                                <span class="revision-time">${new Date(r.timestamp).toLocaleString()}</span>
                            </div>
                        `).join('') || '<p class="no-data">No revisions yet.</p>'}
                    </div>
                    <div class="add-revision">
                        <textarea class="revision-input" placeholder="Suggest a revision..." rows="2"></textarea>
                        <button class="action-btn revision-btn">Submit Revision</button>
                        <div class="action-error revision-error" style="display:none;"></div>
                    </div>
                </div>
            </div>

            <!-- Comments -->
            <div class="comments-section">
                <div class="section-toggle" data-target="comments-${decision.id}">
                    💬 Comments <span class="comment-count">(loading...)</span>
                    <span class="toggle-icon">▼</span>
                </div>
                <div class="collapsible" id="comments-${decision.id}">
                    <div class="comments-list" id="comments-list-${decision.id}">
                        <p class="no-data">Loading comments...</p>
                    </div>
                    <div class="add-comment">
                        <textarea class="comment-input" placeholder="Write a comment..." rows="2"></textarea>
                        <button class="action-btn comment-btn">Post Comment</button>
                        <div class="action-error comment-error" style="display:none;"></div>
                    </div>
                </div>
            </div>
        `;

        // Fetch and render comments
        fetchComments(decision.id, card);

        // Toggle collapsibles
        card.querySelectorAll('.section-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const targetId = toggle.dataset.target;
                const target = document.getElementById(targetId);
                const icon = toggle.querySelector('.toggle-icon');
                target.classList.toggle('open');
                icon.textContent = target.classList.contains('open') ? '▲' : '▼';
            });
        });

        // Submit Revision
        const revisionInput = card.querySelector('.revision-input');
        const revisionBtn   = card.querySelector('.revision-btn');
        const revisionError = card.querySelector('.revision-error');

        revisionBtn.addEventListener('click', async () => {
            const suggestion = revisionInput.value.trim();
            if (!suggestion) {
                revisionError.textContent = '⚠️ Please enter a revision suggestion.';
                revisionError.style.display = 'block';
                return;
            }
            revisionError.style.display = 'none';
            try {
                const res = await fetch(`${API}/decisions/${decision.id}/revisions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ revisedBy: currentUser, suggestion })
                });
                if (res.ok) {
                    const data = await res.json();
                    revisionInput.value = '';
                    // Re-render revisions list
                    const list = card.querySelector('.revisions-list');
                    list.innerHTML = data.revisions.map(r => `
                        <div class="revision-item">
                            <span class="revision-user">🔄 ${escapeHTML(r.revisedBy)}</span>
                            <p>${escapeHTML(r.suggestion)}</p>
                            <span class="revision-time">${new Date(r.timestamp).toLocaleString()}</span>
                        </div>
                    `).join('');
                    card.querySelector('.revision-count').textContent = `(${data.revisions.length})`;
                } else {
                    const err = await res.json();
                    revisionError.textContent = '⚠️ ' + (err.error || 'Failed to submit revision.');
                    revisionError.style.display = 'block';
                }
            } catch (e) {
                revisionError.textContent = '⚠️ Server error. Please try again.';
                revisionError.style.display = 'block';
            }
        });

        // Submit Comment
        const commentInput = card.querySelector('.comment-input');
        const commentBtn   = card.querySelector('.comment-btn');
        const commentError = card.querySelector('.comment-error');

        commentBtn.addEventListener('click', async () => {
            const comment = commentInput.value.trim();
            if (!comment) {
                commentError.textContent = '⚠️ Please enter a comment.';
                commentError.style.display = 'block';
                return;
            }
            commentError.style.display = 'none';
            try {
                const res = await fetch(`${API}/decisions/${decision.id}/comments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: currentUser, comment })
                });
                if (res.ok) {
                    const saved = await res.json();
                    commentInput.value = '';
                    appendComment(saved, card);
                    // Update count
                    const countEl = card.querySelector('.comment-count');
                    const current = parseInt(countEl.textContent.replace(/\D/g, '')) || 0;
                    countEl.textContent = `(${current + 1})`;
                } else {
                    const err = await res.json();
                    commentError.textContent = '⚠️ ' + (err.error || 'Failed to post comment.');
                    commentError.style.display = 'block';
                }
            } catch (e) {
                commentError.textContent = '⚠️ Server error. Please try again.';
                commentError.style.display = 'block';
            }
        });

        return card;
    };

    // ── Fetch & Render Comments ───────────────────────────────────────────────

    const fetchComments = async (decisionId, card) => {
        const list    = card.querySelector(`#comments-list-${decisionId}`);
        const countEl = card.querySelector('.comment-count');
        try {
            const res = await fetch(`${API}/decisions/${decisionId}/comments`);
            if (res.ok) {
                const comments = await res.json();
                countEl.textContent = `(${comments.length})`;
                if (comments.length === 0) {
                    list.innerHTML = '<p class="no-data">No comments yet. Be the first!</p>';
                } else {
                    list.innerHTML = '';
                    comments.forEach(c => appendComment(c, card));
                }
            }
        } catch (e) {
            list.innerHTML = '<p class="no-data">Could not load comments.</p>';
        }
    };

    const appendComment = (commentData, card) => {
        const decisionId = card.dataset.id;
        const list = card.querySelector(`#comments-list-${decisionId}`);

        // Remove "no data" placeholder if present
        const noData = list.querySelector('.no-data');
        if (noData) noData.remove();

        const item = document.createElement('div');
        item.classList.add('comment-item');
        item.innerHTML = `
            <div class="comment-header">
                <span class="comment-user">👤 ${escapeHTML(commentData.username)}</span>
                <span class="comment-time">${new Date(commentData.timestamp).toLocaleString()}</span>
            </div>
            <p class="comment-body">${escapeHTML(commentData.comment)}</p>
        `;
        list.appendChild(item);
    };

    // ── Submit New Decision ───────────────────────────────────────────────────

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let valid = true;

        const problemVal       = problemInput.value.trim();
        const alternativesVal  = alternativesInput.value.trim();
        const finalDecisionVal = finalDecisionInput.value.trim();

        if (!problemVal || !alternativesVal || !finalDecisionVal) {
            formGeneralError.textContent = 'All fields are required';
            formGeneralError.style.display = 'block';
            valid = false;
        } else {
            formGeneralError.style.display = 'none';
        }

        if (problemVal && !/^[A-Za-z\s]+$/.test(problemVal)) {
            problemError.style.display = 'block'; valid = false;
        } else { problemError.style.display = 'none'; }

        if (alternativesVal && !/^[A-Za-z\s,]+$/.test(alternativesVal)) {
            alternativesError.style.display = 'block'; valid = false;
        } else { alternativesError.style.display = 'none'; }

        if (finalDecisionVal && !/^[A-Za-z\s]+$/.test(finalDecisionVal)) {
            finalDecisionError.style.display = 'block'; valid = false;
        } else { finalDecisionError.style.display = 'none'; }

        if (valid) {
            const userName = localStorage.getItem('decisionLogUserName');
            if (!userName) return;

            try {
                const response = await fetch(`${API_BASE_URL}/api/decisions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: userName,
                        problem: problemVal,
                        alternatives: alternativesVal,
                        finalDecision: finalDecisionVal
                    })
                });

                if (response.ok) {
                    const saved = await response.json();
                    const cardElement = createDecisionCard(saved, userName);
                    decisionListContainer.prepend(cardElement);
                    form.reset();
                    formGeneralError.style.display = 'none';

                    // Switch to My Decisions view if on All view
                    if (currentView === 'all') {
                        myDecisionsBtn.click();
                    }
                } else {
                    const data = await response.json();
                    formGeneralError.textContent = data.error || "Failed to save decision";
                    formGeneralError.style.display = 'block';
                }
            } catch (err) {
                console.error(err);
                formGeneralError.textContent = "Server error. Please try again.";
                formGeneralError.style.display = 'block';
            }
        }
    });

    // ── Utility ───────────────────────────────────────────────────────────────

    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.innerText = str;
        return div.innerHTML;
    };
});
