document.addEventListener('DOMContentLoaded', () => {
    // Login Elements
    const loginPage = document.getElementById('login-page');
    const mainApp = document.getElementById('main-app');
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username');
    const loginError = document.getElementById('login-error');
    const welcomeText = document.getElementById('welcome-text');

    // Signup Elements & Links
    const signupPage = document.getElementById('signup-page');
    const toSignupLink = document.getElementById('to-signup-link');
    const toLoginLink = document.getElementById('to-login-link');
    const signupBtn = document.getElementById('signup-btn');
    const signupNameInput = document.getElementById('signup-name');
    const signupContactInput = document.getElementById('signup-contact');
    const signupNameError = document.getElementById('signup-name-error');
    const signupContactError = document.getElementById('signup-contact-error');

    // App Elements
    const form = document.getElementById('decision-form');
    const decisionListContainer = document.getElementById('decision-list');
    const problemInput = document.getElementById('problem');
    const alternativesInput = document.getElementById('alternatives');
    const finalDecisionInput = document.getElementById('final-decision');
    const problemError = document.getElementById('problem-error');
    const alternativesError = document.getElementById('alternatives-error');
    const finalDecisionError = document.getElementById('final-decision-error');
    const formGeneralError = document.getElementById('form-general-error');

    // Navigation Logic
    const signupBackBtn = document.getElementById('signup-back-btn');
    const mainBackBtn = document.getElementById('main-back-btn');
    const logoutBtn = document.getElementById('logout-btn');

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
            // Clear inputs just in case
            signupNameInput.value = '';
            signupContactInput.value = '';
            signupNameError.style.display = 'none';
            signupContactError.style.display = 'none';
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
            usernameInput.value = ''; // clear login name
            loginError.style.display = 'none';
            document.body.classList.remove('main-ui-bg');
        });
    }

    // Handle Login
    const handleLogin = () => {
        const userNameRaw = usernameInput.value;
        const userName = userNameRaw.trim();
        
        if (!userName) {
            loginError.textContent = "Name is required";
            loginError.style.display = 'block';
        } else if (!/^[A-Za-z\s]+$/.test(userName)) {
            loginError.textContent = "Only alphabets are allowed";
            loginError.style.display = 'block';
        } else {
            loginError.style.display = 'none';
            // Store user name temporarily
            localStorage.setItem('decisionLogUserName', userName);
            
            // Show main UI
            loginPage.style.display = 'none';
            signupPage.style.display = 'none';
            mainApp.style.display = 'block';
            document.body.classList.add('main-ui-bg');
            
            // Personalize Header
            welcomeText.textContent = `Welcome, ${userName}`;
        }
    };

    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    if (usernameInput) {
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleLogin();
            }
        });
    }

    // Handle Signup
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            let valid = true;
            const nameValBase = signupNameInput.value;
            const nameVal = nameValBase.trim();
            const contactVal = signupContactInput.value.trim();

            // Name Validation
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

            // Contact Validation
            if (!contactVal) {
                signupContactError.textContent = "Contact number is required";
                signupContactError.style.display = 'block';
                valid = false;
            } else if (!/^[0-9]+$/.test(contactVal)) {
                signupContactError.textContent = "Only numbers are allowed";
                signupContactError.style.display = 'block';
                valid = false;
            } else {
                signupContactError.style.display = 'none';
            }

            if (valid) {
                alert('Signup Successful');
                // Switch to login page
                signupNameInput.value = '';
                signupContactInput.value = '';
                signupPage.style.display = 'none';
                loginPage.style.display = 'flex';
            }
        });
    }

    // Default temporary store for decisions
    const decisions = [];

    // Helper function to create HTML structure for a single decision card
    const createDecisionCard = (decision) => {
        const card = document.createElement('div');
        card.classList.add('decision-card');

        card.innerHTML = `
            <h3>Decision #${decision.id}</h3>
            
            <div class="field">
                <div class="label">Problem</div>
                <div class="value">${escapeHTML(decision.problem)}</div>
            </div>
            
            <div class="field">
                <div class="label">Alternatives</div>
                <div class="value">${escapeHTML(decision.alternatives)}</div>
            </div>
            
            <div class="field">
                <div class="label">Final Decision</div>
                <div class="value">${escapeHTML(decision.finalDecision)}</div>
            </div>
        `;
        
        return card;
    };

    // Helper function to prevent XSS string injection when rendering
    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.innerText = str;
        return div.innerHTML;
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let valid = true;

        // Retrieve values
        const problemVal = problemInput.value.trim();
        const alternativesVal = alternativesInput.value.trim();
        const finalDecisionVal = finalDecisionInput.value.trim();

        // 1. Empty Check
        if (!problemVal || !alternativesVal || !finalDecisionVal) {
            formGeneralError.style.display = 'block';
            valid = false;
        } else {
            formGeneralError.style.display = 'none';
        }

        // 2. Individual Field Validations
        if (problemVal) {
            if (!/^[A-Za-z\s]+$/.test(problemVal)) {
                problemError.style.display = 'block';
                valid = false;
            } else {
                problemError.style.display = 'none';
            }
        } else {
            problemError.style.display = 'none';
        }

        if (alternativesVal) {
            if (!/^[A-Za-z\s,]+$/.test(alternativesVal)) {
                alternativesError.style.display = 'block';
                valid = false;
            } else {
                alternativesError.style.display = 'none';
            }
        } else {
            alternativesError.style.display = 'none';
        }

        if (finalDecisionVal) {
            if (!/^[A-Za-z\s]+$/.test(finalDecisionVal)) {
                finalDecisionError.style.display = 'block';
                valid = false;
            } else {
                finalDecisionError.style.display = 'none';
            }
        } else {
            finalDecisionError.style.display = 'none';
        }

        if (valid) {
            // Add to data store
            const newDecision = {
                id: decisions.length + 1,
                problem: problemVal,
                alternatives: alternativesVal,
                finalDecision: finalDecisionVal,
                timestamp: new Date().toISOString()
            };
            
            decisions.push(newDecision);

            // Render new card
            const cardElement = createDecisionCard(newDecision);
            
            // Prepend so latest appears at the top
            decisionListContainer.prepend(cardElement);

            // Clear the form
            form.reset();
        }
    });
});
