// App State Management
class AppState {
    constructor() {
        this.currentUser = null;
        this.selectedPropertyId = null;
        this.properties = [];
        this.reminders = [];
        this.maintenanceIssues = [];
        this.tenancies = [];
        this.chatMessages = [];
        this.isLoggedIn = false;
        
        this.loadDemoData();
    }
    
    loadDemoData() {
        // Demo properties
        this.properties = [
            {
                id: '1',
                address: '123 Main Street',
                landlords: ['1', '2'],
                isActive: true,
                currentTenancyId: '1'
            },
            {
                id: '2',
                address: '456 Oak Avenue',
                landlords: ['1'],
                isActive: true,
                currentTenancyId: null
            }
        ];
        
        // Demo reminders
        this.reminders = [
            {
                id: '1',
                title: 'Fire Safety Assessment',
                details: 'Annual fire safety check and assessment',
                dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                cost: 120.0,
                type: 'fireSafety',
                recurrenceType: 'annually',
                propertyId: '1',
                isCompleted: false
            },
            {
                id: '2',
                title: 'Monthly Rent Collection',
                details: 'Collect rent from tenant for 123 Main Street',
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                cost: 1200.0,
                type: 'rentPayment',
                recurrenceType: 'monthly',
                propertyId: '1',
                isCompleted: false
            }
        ];
        
        // Demo maintenance issues
        this.maintenanceIssues = [
            {
                id: '1',
                title: 'Leaking Tap in Kitchen',
                description: 'The kitchen tap is dripping constantly',
                status: 'open',
                priority: 'medium',
                reportedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                propertyId: '1'
            }
        ];
        
        // Demo tenancies
        this.tenancies = [
            {
                id: '1',
                propertyId: '1',
                tenantId: '3',
                monthlyRent: 1200.0,
                deposit: 2400.0,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
                status: 'active'
            }
        ];
        
        // Demo chat messages
        this.chatMessages = [
            {
                id: '1',
                senderId: '3',
                content: 'Hi, I wanted to let you know about the leaking tap in the kitchen',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                isFromCurrentUser: false
            },
            {
                id: '2',
                senderId: '1',
                content: 'Thanks for letting me know. I\'ll arrange for a plumber to come by this week',
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                isFromCurrentUser: true
            }
        ];
    }
    
    getRemindersForProperty(propertyId) {
        return this.reminders.filter(reminder => reminder.propertyId === propertyId);
    }
    
    addReminder(reminder) {
        reminder.id = Date.now().toString();
        this.reminders.push(reminder);
        this.saveToLocalStorage();
    }
    
    markReminderComplete(reminderId) {
        const reminder = this.reminders.find(r => r.id === reminderId);
        if (reminder) {
            reminder.isCompleted = true;
            this.saveToLocalStorage();
        }
    }
    
    getRemindersByFilter(filter, propertyId) {
        const propertyReminders = this.getRemindersForProperty(propertyId);
        
        switch (filter) {
            case 'overdue':
                return propertyReminders.filter(r => !r.isCompleted && r.dueDate < new Date());
            case 'dueSoon':
                const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                return propertyReminders.filter(r => 
                    !r.isCompleted && 
                    r.dueDate <= thirtyDaysFromNow && 
                    r.dueDate >= new Date()
                );
            case 'upcoming':
                const thirtyDaysFromNow2 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                return propertyReminders.filter(r => 
                    !r.isCompleted && 
                    r.dueDate > thirtyDaysFromNow2
                );
            case 'completed':
                return propertyReminders.filter(r => r.isCompleted);
            default:
                return propertyReminders;
        }
    }
    
    saveToLocalStorage() {
        localStorage.setItem('tenancyAppData', JSON.stringify({
            properties: this.properties,
            reminders: this.reminders,
            maintenanceIssues: this.maintenanceIssues,
            tenancies: this.tenancies,
            chatMessages: this.chatMessages
        }));
    }
    
    loadFromLocalStorage() {
        const data = localStorage.getItem('tenancyAppData');
        if (data) {
            const parsed = JSON.parse(data);
            this.properties = parsed.properties || this.properties;
            this.reminders = parsed.reminders || this.reminders;
            this.maintenanceIssues = parsed.maintenanceIssues || this.maintenanceIssues;
            this.tenancies = parsed.tenancies || this.tenancies;
            this.chatMessages = parsed.chatMessages || this.chatMessages;
        }
    }
}

// UI Management
class AppUI {
    constructor(appState) {
        this.appState = appState;
        this.currentFilter = 'all';
        this.currentTab = 'property';
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.render();
    }
    
    setupEventListeners() {
        // Login
        document.getElementById('demoLoginBtn').addEventListener('click', () => this.login());
        document.getElementById('loginBtn').addEventListener('click', () => this.login());
        
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.switchFilter(filter);
            });
        });
        
        // Property selector
        document.getElementById('propertySelect').addEventListener('change', (e) => {
            this.appState.selectedPropertyId = e.target.value;
            this.render();
        });
        
        // Add reminder
        document.getElementById('addReminderBtn').addEventListener('click', () => {
            this.showAddReminderModal();
        });
        
        // Modal events
        document.getElementById('closeReminderModal').addEventListener('click', () => {
            this.hideAddReminderModal();
        });
        
        document.getElementById('cancelReminderBtn').addEventListener('click', () => {
            this.hideAddReminderModal();
        });
        
        document.getElementById('addReminderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addReminder();
        });
        
        // Chat
        document.getElementById('sendMessageBtn').addEventListener('click', () => {
            this.sendMessage();
        });
        
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }
    
    login() {
        this.appState.isLoggedIn = true;
        this.appState.currentUser = {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'Landlord'
        };
        this.appState.selectedPropertyId = this.appState.properties[0]?.id;
        this.render();
    }
    
    logout() {
        this.appState.isLoggedIn = false;
        this.appState.currentUser = null;
        this.render();
    }
    
    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tab}Tab`).classList.add('active');
        
        // Render specific content
        switch (tab) {
            case 'reminders':
                this.renderReminders();
                break;
            case 'maintenance':
                this.renderMaintenance();
                break;
            case 'tenancies':
                this.renderTenancies();
                break;
            case 'chat':
                this.renderChat();
                break;
            case 'profile':
                this.renderProfile();
                break;
        }
    }
    
    switchFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        // Re-render content
        if (this.currentTab === 'reminders') {
            this.renderReminders();
        } else if (this.currentTab === 'maintenance') {
            this.renderMaintenance();
        }
    }
    
    render() {
        if (!this.appState.isLoggedIn) {
            this.showLoginScreen();
        } else {
            this.showMainApp();
            this.renderPropertySelector();
            this.renderPropertyDetails();
            this.renderReminders();
            this.renderMaintenance();
            this.renderTenancies();
            this.renderChat();
            this.renderProfile();
        }
    }
    
    showLoginScreen() {
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('mainApp').classList.remove('active');
    }
    
    showMainApp() {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('mainApp').classList.add('active');
    }
    
    renderPropertySelector() {
        const select = document.getElementById('propertySelect');
        select.innerHTML = '<option value="">Select Property</option>';
        
        this.appState.properties.forEach(property => {
            const option = document.createElement('option');
            option.value = property.id;
            option.textContent = property.address;
            if (property.id === this.appState.selectedPropertyId) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }
    
    renderPropertyDetails() {
        const property = this.appState.properties.find(p => p.id === this.appState.selectedPropertyId);
        if (property) {
            document.getElementById('propertyAddress').textContent = property.address;
            document.getElementById('propertyStatus').textContent = property.isActive ? 'Active Property' : 'Inactive Property';
            document.getElementById('landlordCount').textContent = property.landlords.length;
            document.getElementById('tenancyCount').textContent = property.currentTenancyId ? '1' : '0';
        }
    }
    
    renderReminders() {
        const container = document.getElementById('remindersList');
        const reminders = this.appState.getRemindersByFilter(this.currentFilter, this.appState.selectedPropertyId);
        
        if (reminders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar"></i>
                    <h3>No Reminders</h3>
                    <p>Add important dates and deadlines to stay organized</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = reminders.map(reminder => this.createReminderCard(reminder)).join('');
        
        // Add event listeners to complete buttons
        container.querySelectorAll('.btn-complete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.appState.markReminderComplete(btn.dataset.id);
                this.renderReminders();
            });
        });
    }
    
    createReminderCard(reminder) {
        const status = this.getReminderStatus(reminder);
        
        return `
            <div class="reminder-card" data-id="${reminder.id}">
                <div class="reminder-header">
                    <div>
                        <div class="reminder-title">${reminder.title}</div>
                        <div class="reminder-type">${this.getTypeDisplayName(reminder.type)}</div>
                    </div>
                    <div class="reminder-status ${status.class}">${status.text}</div>
                </div>
                
                <div class="reminder-details">
                    <div class="reminder-cost">Cost: ${reminder.cost ? `£${reminder.cost.toFixed(2)}` : 'No cost'}</div>
                    <div class="reminder-date">Due: ${reminder.dueDate.toLocaleDateString()}</div>
                </div>
                
                ${!reminder.isCompleted ? `
                    <div class="reminder-actions">
                        <button class="btn-complete" data-id="${reminder.id}">Mark Complete</button>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    getReminderStatus(reminder) {
        if (reminder.isCompleted) {
            return { text: 'Completed', class: 'completed' };
        } else if (reminder.dueDate < new Date()) {
            return { text: 'Overdue', class: 'overdue' };
        } else if (reminder.dueDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
            return { text: 'Due Soon', class: 'due-soon' };
        } else {
            return { text: 'Upcoming', class: 'upcoming' };
        }
    }
    
    getTypeDisplayName(type) {
        const typeNames = {
            gasCertificate: 'Gas Certificate',
            rentPayment: 'Rent Payment',
            insurance: 'Insurance',
            epcCertificate: 'EPC Certificate',
            fireSafety: 'Fire Safety',
            electricalInspection: 'Electrical Inspection',
            councilTax: 'Council Tax',
            utilities: 'Utilities',
            maintenance: 'Maintenance',
            other: 'Other'
        };
        return typeNames[type] || type;
    }
    
    showAddReminderModal() {
        document.getElementById('addReminderModal').classList.add('active');
    }
    
    hideAddReminderModal() {
        document.getElementById('addReminderModal').classList.remove('active');
        document.getElementById('addReminderForm').reset();
    }
    
    addReminder() {
        const reminder = {
            title: document.getElementById('reminderTitle').value,
            details: document.getElementById('reminderDetails').value,
            type: document.getElementById('reminderType').value,
            dueDate: new Date(document.getElementById('reminderDueDate').value),
            cost: parseFloat(document.getElementById('reminderCost').value) || null,
            recurrenceType: document.getElementById('reminderRecurrence').value,
            propertyId: this.appState.selectedPropertyId,
            isCompleted: false
        };
        
        this.appState.addReminder(reminder);
        this.hideAddReminderModal();
        this.renderReminders();
    }
    
    renderMaintenance() {
        const container = document.getElementById('maintenanceList');
        const issues = this.appState.maintenanceIssues.filter(issue => 
            issue.propertyId === this.appState.selectedPropertyId
        );
        
        if (issues.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-wrench"></i>
                    <h3>No Maintenance Issues</h3>
                    <p>Report maintenance issues and they'll appear here</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = issues.map(issue => `
            <div class="maintenance-card">
                <div class="maintenance-header">
                    <h3>${issue.title}</h3>
                    <span class="status-badge ${issue.status}">${issue.status}</span>
                </div>
                <p>${issue.description}</p>
                <div class="maintenance-meta">
                    <span>Priority: ${issue.priority}</span>
                    <span>Reported: ${issue.reportedDate.toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    }
    
    renderTenancies() {
        const container = document.getElementById('tenanciesList');
        const tenancies = this.appState.tenancies.filter(tenancy => 
            tenancy.propertyId === this.appState.selectedPropertyId
        );
        
        if (tenancies.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <h3>No Tenancies</h3>
                    <p>Add tenancies to manage your rental agreements</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = tenancies.map(tenancy => `
            <div class="tenancy-card">
                <div class="tenancy-header">
                    <h3>Tenancy Agreement</h3>
                    <span class="status-badge ${tenancy.status}">${tenancy.status}</span>
                </div>
                <div class="tenancy-details">
                    <div>Monthly Rent: £${tenancy.monthlyRent.toFixed(2)}</div>
                    <div>Deposit: £${tenancy.deposit.toFixed(2)}</div>
                    <div>Start Date: ${tenancy.startDate.toLocaleDateString()}</div>
                    <div>End Date: ${tenancy.endDate.toLocaleDateString()}</div>
                </div>
            </div>
        `).join('');
    }
    
    renderChat() {
        const container = document.getElementById('chatMessages');
        container.innerHTML = this.appState.chatMessages.map(message => `
            <div class="chat-message ${message.isFromCurrentUser ? 'sent' : 'received'}">
                <div class="message-bubble ${message.isFromCurrentUser ? 'sent' : 'received'}">
                    ${message.content}
                </div>
                <div class="message-time">${message.timestamp.toLocaleTimeString()}</div>
            </div>
        `).join('');
        
        container.scrollTop = container.scrollHeight;
    }
    
    sendMessage() {
        const input = document.getElementById('messageInput');
        const content = input.value.trim();
        
        if (content) {
            const message = {
                id: Date.now().toString(),
                senderId: this.appState.currentUser.id,
                content: content,
                timestamp: new Date(),
                isFromCurrentUser: true
            };
            
            this.appState.chatMessages.push(message);
            this.renderChat();
            input.value = '';
        }
    }
    
    renderProfile() {
        // Render property selector in profile
        const container = document.getElementById('propertySelectorList');
        container.innerHTML = this.appState.properties.map(property => `
            <div class="property-option ${property.id === this.appState.selectedPropertyId ? 'selected' : ''}" 
                 data-id="${property.id}">
                <span>${property.address}</span>
                <span>${property.isActive ? 'Active' : 'Inactive'}</span>
            </div>
        `).join('');
        
        // Add event listeners
        container.querySelectorAll('.property-option').forEach(option => {
            option.addEventListener('click', () => {
                this.appState.selectedPropertyId = option.dataset.id;
                this.render();
            });
        });
        
        // Update user info
        if (this.appState.currentUser) {
            document.getElementById('userName').textContent = this.appState.currentUser.name;
            document.getElementById('userEmail').textContent = this.appState.currentUser.email;
            document.getElementById('userRole').textContent = this.appState.currentUser.role;
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const appState = new AppState();
    appState.loadFromLocalStorage();
    
    const appUI = new AppUI(appState);
    
    // Make app state globally accessible for debugging
    window.appState = appState;
    window.appUI = appUI;
});
