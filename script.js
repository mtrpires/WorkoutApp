document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const views = document.querySelectorAll('.view');
    const planListView = document.getElementById('plan-list-view');
    const createEditPlanView = document.getElementById('create-edit-plan-view');
    const editExercisesView = document.getElementById('edit-exercises-view');
    const workoutSessionView = document.getElementById('workout-session-view');
    const planOverviewView = document.getElementById('plan-overview-view');

    const planListUl = document.getElementById('plan-list');
    const noPlansLi = planListView.querySelector('.no-plans');
    const btnShowCreatePlan = document.getElementById('btn-show-create-plan');

    // Plan Form Elements
    const planForm = document.getElementById('plan-form');
    const planFormTitle = document.getElementById('plan-form-title');
    const planIdInput = document.getElementById('plan-id');
    const planNameInput = document.getElementById('plan-name');
    const planTypeSelect = document.getElementById('plan-type');
    const planDurationInput = document.getElementById('plan-duration');
    const btnSavePlanDetails = document.getElementById('btn-save-plan-details');
    const btnCancelPlanDetails = document.getElementById('btn-cancel-plan-details');

    // Edit Exercises Elements
    const editExercisesTitle = document.getElementById('edit-exercises-title').querySelector('span');
    const totalWeeksDisplay = document.getElementById('total-weeks-display');
    const weekSelect = document.getElementById('week-select');
    const currentWeekDisplay = document.getElementById('current-week-display');
    const exerciseListForWeekUl = document.getElementById('exercise-list-for-week');
    const addExerciseForm = document.getElementById('add-exercise-form');
    const exerciseSelect = document.getElementById('exercise-select');
    const customExerciseNameInput = document.getElementById('custom-exercise-name');
    const exerciseSetsInput = document.getElementById('exercise-sets');
    const exerciseRepsInput = document.getElementById('exercise-reps');
    const exerciseWeightInput = document.getElementById('exercise-weight');
    const exerciseCommentsInput = document.getElementById('exercise-comments');
    const btnAddExercise = document.getElementById('btn-add-exercise');
    const btnFinishEditingPlan = document.getElementById('btn-finish-editing-plan');
    const btnViewPlanOverview = document.getElementById('btn-view-plan-overview');
    const btnReplicateWeek = document.getElementById('btn-replicate-week');
    const replicateOptionsDiv = document.getElementById('replicate-options');
    const replicateSourceWeekSpan = document.getElementById('replicate-source-week');
    const replicateTargetWeeksDiv = document.getElementById('replicate-target-weeks');
    const btnConfirmReplicate = document.getElementById('btn-confirm-replicate');
    const btnCancelReplicate = document.getElementById('btn-cancel-replicate');

    // Workout Session Elements
    const workoutSessionTitle = document.getElementById('workout-session-title');
    const workoutDateSpan = document.getElementById('workout-date');
    const workoutProgressBar = document.getElementById('workout-progress-bar');
    const workoutProgressText = document.getElementById('workout-progress-text');
    const workoutExerciseListUl = document.getElementById('workout-exercise-list');
    const btnFinishWorkout = document.getElementById('btn-finish-workout');
    const btnBackToPlanListFromWorkout = document.getElementById('btn-back-to-plan-list-from-workout');

     // Plan Overview Elements
    const overviewTitle = document.getElementById('overview-title').querySelector('span');
    const overviewContentDiv = document.getElementById('overview-content');
    const btnBackToPlanListFromOverview = document.getElementById('btn-back-to-plan-list-from-overview');
    const btnEditPlanFromOverview = document.getElementById('btn-edit-plan-from-overview');


    // --- State Variables ---
    let workoutPlans = []; // Array to hold all plan objects
    let currentEditingPlanId = null;
    let currentEditingWeek = 1;
    let currentWorkoutPlanId = null; // ID of the plan being worked out
    let currentWorkoutWeek = null; // Week number being worked out
    let currentOverviewPlanId = null; // ID of plan being viewed in overview

    // --- Predefined Exercises ---
    const predefinedExercises = {
        gym: [
            "Barbell Bench Press", "Overhead Press", "Barbell Squat", "Deadlift",
            "Pull Up", "Chin Up", "Bent Over Row", "Dumbbell Bench Press",
            "Dumbbell Curl", "Triceps Pushdown", "Leg Press", "Leg Extension",
            "Hamstring Curl", "Lat Pulldown", "Seated Cable Row", "Lateral Raise"
        ],
        home: [
            "Push Up", "Squat", "Lunge", "Plank", "Jumping Jacks",
            "Burpee", "Sit Up", "Crunch", "Glute Bridge", "Mountain Climber",
            "Tricep Dip (chair)", "Pike Push Up", "Superman"
        ],
        other: [] // Can add more or leave empty
    };

    // --- Utility Functions ---

    // Show specific view, hide others
    function showView(viewId) {
        views.forEach(view => view.classList.remove('active-view'));
        const activeView = document.getElementById(viewId);
        if (activeView) {
            activeView.classList.add('active-view');
        } else {
            console.error(`View with ID ${viewId} not found.`);
            planListView.classList.add('active-view'); // Fallback to default
        }
    }

    // Generate unique ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    // Get current date string
    function getCurrentDate() {
        return new Date().toLocaleDateString(undefined, { // Use user's locale
            year: 'numeric', month: 'short', day: 'numeric'
        });
    }

    // Save plans to local storage
    function savePlans() {
        try {
            localStorage.setItem('workoutPlans', JSON.stringify(workoutPlans));
        } catch (error) {
            console.error("Error saving to localStorage:", error);
            alert("Could not save workout plans. Local storage might be full or disabled.");
        }
    }

    // Load plans from local storage
    function loadPlans() {
        const storedPlans = localStorage.getItem('workoutPlans');
        if (storedPlans) {
            try {
                workoutPlans = JSON.parse(storedPlans);
                // Basic validation/migration could happen here if structure changes
                if (!Array.isArray(workoutPlans)) {
                    workoutPlans = [];
                }
            } catch (error) {
                console.error("Error parsing plans from localStorage:", error);
                workoutPlans = []; // Reset if data is corrupted
                localStorage.removeItem('workoutPlans'); // Clear corrupted data
            }
        } else {
            workoutPlans = [];
        }
    }

    // --- Rendering Functions ---

    // Render the list of workout plans
    function renderPlanList() {
        planListUl.innerHTML = ''; // Clear current list
        if (workoutPlans.length === 0) {
            noPlansLi.style.display = 'block'; // Show "No plans" message
        } else {
            noPlansLi.style.display = 'none'; // Hide "No plans" message
            workoutPlans.forEach(plan => {
                const li = document.createElement('li');
                li.dataset.planId = plan.id;
                li.innerHTML = `
                    <strong>${plan.name}</strong> (${plan.type}, ${plan.durationWeeks} Weeks)
                    <div class="plan-actions">
                        <button class="btn-start-workout btn-small">Start Workout</button>
                        <button class="btn-edit-plan btn-small btn-secondary">Edit</button>
                        <button class="btn-view-overview btn-small btn-secondary">Overview</button>
                        <button class="btn-delete-plan btn-small btn-danger">Delete</button>
                    </div>
                `;
                planListUl.appendChild(li);
            });
        }
    }

     // Populate week dropdown for editing exercises
    function populateWeekSelect(plan) {
        weekSelect.innerHTML = '';
        for (let i = 1; i <= plan.durationWeeks; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Week ${i}`;
            weekSelect.appendChild(option);
        }
        weekSelect.value = currentEditingWeek; // Select the current week
    }

    // Populate predefined exercises dropdown based on plan type
    function populateExerciseSelect(planType) {
        exerciseSelect.innerHTML = '<option value="">-- Select Predefined --</option>';
        const typeKey = predefinedExercises[planType] ? planType : 'other'; // Fallback
        predefinedExercises[typeKey].forEach(exName => {
            const option = document.createElement('option');
            option.value = exName;
            option.textContent = exName;
            exerciseSelect.appendChild(option);
        });
        // Add option for custom if needed, though the text input serves this
    }

     // Render exercises for the selected week in the editor
    function renderExercisesForWeek(planId, weekNum) {
        const plan = workoutPlans.find(p => p.id === planId);
        if (!plan) return;

        currentEditingWeek = parseInt(weekNum);
        currentWeekDisplay.textContent = currentEditingWeek;
        exerciseListForWeekUl.innerHTML = ''; // Clear list

        const weekExercises = plan.weeks?.[currentEditingWeek] || []; // Get exercises or empty array

        if (weekExercises.length === 0) {
            exerciseListForWeekUl.innerHTML = '<li class="no-plans">No exercises added for this week yet.</li>';
        } else {
            weekExercises.forEach((ex, index) => {
                const li = document.createElement('li');
                li.dataset.exerciseIndex = index; // Store index for deletion/editing
                li.innerHTML = `
                    <strong>${ex.name}</strong>
                    <div class="exercise-details">
                        <span><strong>Sets:</strong> ${ex.sets}</span>
                        <span><strong>Reps:</strong> ${ex.reps}</span>
                        ${ex.weight ? `<span><strong>Weight:</strong> ${ex.weight}</span>` : ''}
                    </div>
                    ${ex.comments ? `<p class="exercise-comments"><em>${ex.comments}</em></p>` : ''}
                    <div class="exercise-actions">
                        <button class="btn-delete-exercise btn-small btn-danger">Delete</button>
                        </div>
                `;
                exerciseListForWeekUl.appendChild(li);
            });
        }
         // Hide replicate options when changing week
         replicateOptionsDiv.classList.add('hidden');
    }

    // Render the workout session view
    function renderWorkoutSession(planId) {
        const plan = workoutPlans.find(p => p.id === planId);
        if (!plan) {
            alert('Error: Plan not found.');
            showView('plan-list-view');
            return;
        }

        currentWorkoutPlanId = planId;
        // Simple logic: Find the first week with exercises that isn't fully completed yet.
        // More complex logic could involve start dates.
        let targetWeek = 1;
        let foundWeek = false;
        for (let w = 1; w <= plan.durationWeeks; w++) {
             const weekExercises = plan.weeks?.[w] || [];
             if (weekExercises.length > 0) {
                const allSetsInWeek = weekExercises.reduce((total, ex) => total + parseInt(ex.sets || 0), 0);
                const completedSetsInWeek = weekExercises.reduce((total, ex) => total + (ex.setsCompleted?.filter(Boolean).length || 0), 0);
                if (completedSetsInWeek < allSetsInWeek) {
                    targetWeek = w;
                    foundWeek = true;
                    break;
                }
             }
        }
        // If all weeks with exercises are done, maybe start from week 1 again or show a message?
        // For now, default to the found targetWeek or week 1 if no incomplete found
        currentWorkoutWeek = targetWeek;

        workoutSessionTitle.querySelector('span:first-of-type').textContent = plan.name;
        workoutSessionTitle.querySelector('span:last-of-type').textContent = currentWorkoutWeek;
        workoutDateSpan.textContent = getCurrentDate();
        workoutExerciseListUl.innerHTML = ''; // Clear previous workout

        const exercises = plan.weeks?.[currentWorkoutWeek] || [];
        if (exercises.length === 0) {
             workoutExerciseListUl.innerHTML = '<li class="no-plans">No exercises scheduled for this week.</li>';
             updateWorkoutProgress(); // Show 0% progress
             return;
        }

        exercises.forEach((ex, index) => {
            const li = document.createElement('li');
            li.dataset.exerciseIndex = index;

            // Ensure setsCompleted array exists and matches the number of sets
            if (!ex.setsCompleted || ex.setsCompleted.length !== parseInt(ex.sets)) {
                ex.setsCompleted = Array(parseInt(ex.sets)).fill(false);
            }

            let setCheckboxesHtml = '';
            for (let i = 0; i < ex.sets; i++) {
                const isChecked = ex.setsCompleted[i];
                setCheckboxesHtml += `
                    <label class="${isChecked ? 'set-completed-label' : ''}">
                        <input type="checkbox" class="set-checkbox" data-set-index="${i}" ${isChecked ? 'checked' : ''}>
                        Set ${i + 1}
                    </label>
                `;
            }

            li.innerHTML = `
                <strong>${ex.name}</strong>
                <div class="exercise-details">
                    <span><strong>Reps:</strong> ${ex.reps}</span>
                    ${ex.weight ? `<span><strong>Weight:</strong> ${ex.weight}</span>` : ''}
                </div>
                ${ex.comments ? `<p class="exercise-comments"><em>${ex.comments}</em></p>` : ''}
                <div class="set-tracker">
                    ${setCheckboxesHtml}
                </div>
            `;
            workoutExerciseListUl.appendChild(li);
        });

        updateWorkoutProgress(); // Initial progress calculation
    }

    // Render the plan overview
    function renderPlanOverview(planId) {
        const plan = workoutPlans.find(p => p.id === planId);
        if (!plan) {
            alert("Error: Plan not found.");
            showView('plan-list-view');
            return;
        }
        currentOverviewPlanId = planId; // Store for the edit button

        overviewTitle.textContent = plan.name;
        overviewContentDiv.innerHTML = ''; // Clear previous overview

        if (!plan.weeks || Object.keys(plan.weeks).length === 0) {
            overviewContentDiv.innerHTML = '<p>No exercises have been added to this plan yet.</p>';
            return;
        }

        for (let weekNum = 1; weekNum <= plan.durationWeeks; weekNum++) {
            const weekExercises = plan.weeks[weekNum] || [];
            const weekDiv = document.createElement('div');
            weekDiv.classList.add('week-overview');

            let exercisesHtml = '<ul>';
            if (weekExercises.length > 0) {
                weekExercises.forEach(ex => {
                    exercisesHtml += `
                        <li>
                            ${ex.name}
                            <span>(${ex.sets} sets, ${ex.reps} reps${ex.weight ? `, ${ex.weight}` : ''})</span>
                        </li>
                    `;
                });
            } else {
                exercisesHtml += '<li><em>No exercises scheduled.</em></li>';
            }
            exercisesHtml += '</ul>';

            weekDiv.innerHTML = `<h4>Week ${weekNum}</h4>${exercisesHtml}`;
            overviewContentDiv.appendChild(weekDiv);
        }
    }

    // --- Event Handlers ---

    // Show create plan form
    btnShowCreatePlan.addEventListener('click', () => {
        currentEditingPlanId = null; // Ensure it's a new plan
        planForm.reset(); // Clear form fields
        planIdInput.value = ''; // Clear hidden ID
        planFormTitle.textContent = 'Create New Plan';
        btnSavePlanDetails.textContent = 'Save & Add Exercises';
        showView('create-edit-plan-view');
    });

    // Cancel creating/editing plan details
    btnCancelPlanDetails.addEventListener('click', () => {
        showView('plan-list-view');
    });

    // Save plan details (name, type, duration)
    planForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const planId = planIdInput.value;
        const planName = planNameInput.value.trim();
        const planType = planTypeSelect.value;
        const planDuration = parseInt(planDurationInput.value);

        if (!planName || !planType || !planDuration || planDuration < 1) {
            alert('Please fill in all plan details correctly.');
            return;
        }

        let plan;
        if (planId) { // Editing existing plan details
            plan = workoutPlans.find(p => p.id === planId);
            if (plan) {
                plan.name = planName;
                plan.type = planType;
                // Adjust weeks if duration changes (simple truncation or padding)
                if (plan.durationWeeks !== planDuration) {
                     const newWeeks = {};
                     for (let i = 1; i <= planDuration; i++) {
                         if (plan.weeks && plan.weeks[i]) {
                             newWeeks[i] = plan.weeks[i];
                         } else {
                             // Optionally add empty array: newWeeks[i] = [];
                         }
                     }
                     plan.weeks = newWeeks;
                }
                plan.durationWeeks = planDuration;
                currentEditingPlanId = plan.id; // Keep track
            } else {
                alert("Error: Plan to edit not found.");
                return;
            }
        } else { // Creating new plan
            plan = {
                id: generateId(),
                name: planName,
                type: planType,
                durationWeeks: planDuration,
                weeks: {}, // Initialize weeks object
                // startDate: null, // Could add later
                // isActive: false // Could add later
            };
            workoutPlans.push(plan);
            currentEditingPlanId = plan.id; // Set the ID for the next step
        }

        savePlans();
        renderPlanList(); // Update list in background

        // Go to edit exercises view for this plan
        editExercisesTitle.textContent = plan.name;
        totalWeeksDisplay.textContent = plan.durationWeeks;
        currentEditingWeek = 1; // Start editing from week 1
        populateWeekSelect(plan);
        populateExerciseSelect(plan.type);
        renderExercisesForWeek(plan.id, currentEditingWeek);
        showView('edit-exercises-view');
    });

    // Handle week selection change in exercise editor
    weekSelect.addEventListener('change', (e) => {
        renderExercisesForWeek(currentEditingPlanId, e.target.value);
    });

    // Add Exercise form submission
    addExerciseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const plan = workoutPlans.find(p => p.id === currentEditingPlanId);
        if (!plan) return;

        const selectedPredefined = exerciseSelect.value;
        const customName = customExerciseNameInput.value.trim();
        const exerciseName = customName || selectedPredefined;

        if (!exerciseName) {
            alert('Please select a predefined exercise or enter a custom name.');
            return;
        }

        const sets = parseInt(exerciseSetsInput.value);
        const reps = exerciseRepsInput.value.trim();
        const weight = exerciseWeightInput.value.trim();
        const comments = exerciseCommentsInput.value.trim();

        if (!sets || sets < 1 || !reps) {
            alert('Please enter valid sets and reps.');
            return;
        }

        const newExercise = {
            id: generateId(), // Unique ID for the exercise instance
            name: exerciseName,
            sets: sets,
            reps: reps,
            weight: weight,
            comments: comments,
            setsCompleted: Array(sets).fill(false) // Track completion per set
        };

        // Ensure the week exists in the plan's weeks object
        if (!plan.weeks[currentEditingWeek]) {
            plan.weeks[currentEditingWeek] = [];
        }

        plan.weeks[currentEditingWeek].push(newExercise);
        savePlans();

        // Re-render the list and clear the form
        renderExercisesForWeek(plan.id, currentEditingWeek);
        addExerciseForm.reset();
        exerciseSelect.value = ''; // Reset dropdown
    });

     // Event delegation for deleting an exercise from a week
    exerciseListForWeekUl.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete-exercise')) {
            const exerciseLi = e.target.closest('li');
            const exerciseIndex = parseInt(exerciseLi.dataset.exerciseIndex);

            if (confirm('Are you sure you want to delete this exercise?')) {
                const plan = workoutPlans.find(p => p.id === currentEditingPlanId);
                if (plan && plan.weeks[currentEditingWeek]) {
                    plan.weeks[currentEditingWeek].splice(exerciseIndex, 1);
                    savePlans();
                    renderExercisesForWeek(plan.id, currentEditingWeek); // Re-render
                }
            }
        }
    });

    // Finish editing exercises, go back to plan list
    btnFinishEditingPlan.addEventListener('click', () => {
        currentEditingPlanId = null;
        showView('plan-list-view');
    });

    // Go to overview from edit screen
    btnViewPlanOverview.addEventListener('click', () => {
        if(currentEditingPlanId) {
             renderPlanOverview(currentEditingPlanId);
             showView('plan-overview-view');
        }
    });

    // Show replicate options
    btnReplicateWeek.addEventListener('click', () => {
        const plan = workoutPlans.find(p => p.id === currentEditingPlanId);
        if (!plan || !plan.weeks || !plan.weeks[currentEditingWeek] || plan.weeks[currentEditingWeek].length === 0) {
            alert('No exercises in the current week to replicate.');
            return;
        }

        replicateSourceWeekSpan.textContent = currentEditingWeek;
        replicateTargetWeeksDiv.innerHTML = ''; // Clear previous checkboxes

        for (let i = 1; i <= plan.durationWeeks; i++) {
            if (i !== currentEditingWeek) { // Don't offer to replicate to the same week
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = i;
                checkbox.id = `replicate-week-${i}`;
                label.htmlFor = checkbox.id;
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(` Week ${i}`));
                replicateTargetWeeksDiv.appendChild(label);
            }
        }
        replicateOptionsDiv.classList.remove('hidden');
    });

    // Cancel replication
    btnCancelReplicate.addEventListener('click', () => {
         replicateOptionsDiv.classList.add('hidden');
    });

    // Confirm replication
    btnConfirmReplicate.addEventListener('click', () => {
        const plan = workoutPlans.find(p => p.id === currentEditingPlanId);
        if (!plan || !plan.weeks || !plan.weeks[currentEditingWeek]) return;

        const sourceExercises = plan.weeks[currentEditingWeek];
        const targetWeekCheckboxes = replicateTargetWeeksDiv.querySelectorAll('input[type="checkbox"]:checked');

        if (targetWeekCheckboxes.length === 0) {
            alert('Please select at least one week to replicate to.');
            return;
        }

        targetWeekCheckboxes.forEach(checkbox => {
            const targetWeek = parseInt(checkbox.value);
            // Deep copy exercises to avoid reference issues, reset completion status
            plan.weeks[targetWeek] = sourceExercises.map(ex => ({
                ...ex,
                id: generateId(), // Generate new ID for the copied exercise instance
                setsCompleted: Array(ex.sets).fill(false)
            }));
        });

        savePlans();
        alert(`Exercises replicated from Week ${currentEditingWeek} to selected weeks.`);
        replicateOptionsDiv.classList.add('hidden');
        // Optionally, navigate to the first replicated week or re-render current
        renderExercisesForWeek(plan.id, currentEditingWeek);
    });


    // --- Event delegation for Plan List actions ---
    planListUl.addEventListener('click', (e) => {
        const planLi = e.target.closest('li[data-plan-id]');
        if (!planLi) return;
        const planId = planLi.dataset.planId;

        // Edit Plan Button
        if (e.target.classList.contains('btn-edit-plan')) {
            const plan = workoutPlans.find(p => p.id === planId);
            if (plan) {
                currentEditingPlanId = plan.id;
                planFormTitle.textContent = 'Edit Plan Details';
                btnSavePlanDetails.textContent = 'Update & Edit Exercises';
                planIdInput.value = plan.id;
                planNameInput.value = plan.name;
                planTypeSelect.value = plan.type;
                planDurationInput.value = plan.durationWeeks;
                showView('create-edit-plan-view');
                 // Pre-load exercise editing state in case user goes directly there
                 editExercisesTitle.textContent = plan.name;
                 totalWeeksDisplay.textContent = plan.durationWeeks;
                 currentEditingWeek = 1;
                 populateWeekSelect(plan);
                 populateExerciseSelect(plan.type);
                 renderExercisesForWeek(plan.id, currentEditingWeek);
            }
        }
        // Delete Plan Button
        else if (e.target.classList.contains('btn-delete-plan')) {
            if (confirm('Are you sure you want to delete this entire workout plan? This cannot be undone.')) {
                workoutPlans = workoutPlans.filter(p => p.id !== planId);
                savePlans();
                renderPlanList(); // Re-render the list
            }
        }
        // Start Workout Button
        else if (e.target.classList.contains('btn-start-workout')) {
             renderWorkoutSession(planId);
             showView('workout-session-view');
        }
         // View Overview Button
        else if (e.target.classList.contains('btn-view-overview')) {
             renderPlanOverview(planId);
             showView('plan-overview-view');
        }
    });

     // --- Workout Session Logic ---

    // Event delegation for checking off sets
    workoutExerciseListUl.addEventListener('click', (e) => {
        if (e.target.classList.contains('set-checkbox')) {
            const checkbox = e.target;
            const setIndex = parseInt(checkbox.dataset.setIndex);
            const exerciseLi = checkbox.closest('li[data-exercise-index]');
            const exerciseIndex = parseInt(exerciseLi.dataset.exerciseIndex);
            const label = checkbox.closest('label');

            const plan = workoutPlans.find(p => p.id === currentWorkoutPlanId);
            if (plan && plan.weeks[currentWorkoutWeek] && plan.weeks[currentWorkoutWeek][exerciseIndex]) {
                const exercise = plan.weeks[currentWorkoutWeek][exerciseIndex];
                exercise.setsCompleted[setIndex] = checkbox.checked; // Update completion status

                 // Toggle strikethrough style on label
                 if (checkbox.checked) {
                    label.classList.add('set-completed-label');
                } else {
                    label.classList.remove('set-completed-label');
                }

                savePlans(); // Save immediately on change
                updateWorkoutProgress(); // Update the progress bar
            }
        }
    });

    // Calculate and update workout progress
    function updateWorkoutProgress() {
        const plan = workoutPlans.find(p => p.id === currentWorkoutPlanId);
        if (!plan || !currentWorkoutWeek || !plan.weeks[currentWorkoutWeek]) {
             workoutProgressBar.value = 0;
             workoutProgressText.textContent = '0%';
             return;
        }

        const exercises = plan.weeks[currentWorkoutWeek];
        let totalSets = 0;
        let completedSets = 0;

        exercises.forEach(ex => {
            totalSets += parseInt(ex.sets || 0);
            completedSets += (ex.setsCompleted?.filter(Boolean).length || 0);
        });

        const progress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
        workoutProgressBar.value = progress;
        workoutProgressText.textContent = `${progress}%`;
    }

     // Finish workout button
     btnFinishWorkout.addEventListener('click', () => {
         // Could add logic here: mark week as completed if all sets are done, etc.
         alert('Workout session ended!'); // Simple feedback
         currentWorkoutPlanId = null;
         currentWorkoutWeek = null;
         showView('plan-list-view');
     });

    // Back buttons
    btnBackToPlanListFromWorkout.addEventListener('click', () => showView('plan-list-view'));
    btnBackToPlanListFromOverview.addEventListener('click', () => showView('plan-list-view'));

    // Edit plan from overview screen
    btnEditPlanFromOverview.addEventListener('click', () => {
        if (currentOverviewPlanId) {
            const plan = workoutPlans.find(p => p.id === currentOverviewPlanId);
             if (plan) {
                // Similar logic to editing from list view, navigate to details first
                 currentEditingPlanId = plan.id;
                 planFormTitle.textContent = 'Edit Plan Details';
                 btnSavePlanDetails.textContent = 'Update & Edit Exercises';
                 planIdInput.value = plan.id;
                 planNameInput.value = plan.name;
                 planTypeSelect.value = plan.type;
                 planDurationInput.value = plan.durationWeeks;
                 showView('create-edit-plan-view');
                 // Pre-load exercise editing state
                 editExercisesTitle.textContent = plan.name;
                 totalWeeksDisplay.textContent = plan.durationWeeks;
                 currentEditingWeek = 1;
                 populateWeekSelect(plan);
                 populateExerciseSelect(plan.type);
                 renderExercisesForWeek(plan.id, currentEditingWeek);
            }
        } else {
             showView('plan-list-view'); // Fallback
        }
    });


    // --- Initial Load ---
    function initializeApp() {
        loadPlans();
        renderPlanList();
        showView('plan-list-view'); // Start at the plan list
    }

    initializeApp();

}); // End DOMContentLoaded