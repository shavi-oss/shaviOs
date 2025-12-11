# HR Module Integrations - Implementation Guide

## Overview

This document outlines the integration points between the HR module and other Shavi Academy OS modules (Sales, Finance, Operations, Customer Support).

---

## 1. Sales Integration

### KPI Data Flow: Sales → HR

**Trigger**: Sales team member closes a deal or achieves target

**Data Sync**:
```typescript
// When deal is closed in Sales module
const updateEmployeeKPI = async (employeeId: string, dealValue: number) => {
    // Update employee_kpis table
    await supabase
        .from('employee_kpis')
        .update({
            current_value: currentValue + dealValue,
            achievement_rate: (currentValue / targetValue) * 100,
            updated_at: new Date().toISOString()
        })
        .eq('employee_id', employeeId)
        .eq('kpi_name', 'Revenue Target');
    
    // Trigger notification if threshold met
    if (achievement_rate >= 100) {
        await notifyHR(employeeId, 'commission_eligible');
    }
};
```

**HR Dashboard Impact**:
- Performance Dashboard updates in real-time
- Leaderboard automatically re-ranks
- Commission alerts triggered
- Employee profile KPI bars update

**Integration Points**:
- `/sales/my-deals` → Updates employee performance
- `/sales/pipeline` → Stage changes = KPI updates
- Employee commission calculations based on sales data

---

## 2. Finance Integration

### Payroll Data: HR → Finance

**Trigger**: HR processes monthly payroll

**Data Sync**:
```typescript
const syncPayrollToFinance = async (payrollData: Payroll[]) => {
    for (const employee of payrollData) {
        // Create expense entry in Finance
        await supabase
            .from('expenses')
            .insert({
                category: 'Payroll',
                amount: employee.net_salary,
                description: `Payroll - ${employee.employee_name} - ${month}`,
                date: new Date().toISOString(),
                status: 'pending',
                department_id: employee.department_id,
                employee_id: employee.employee_id
            });
    }
    
    // Update Finance dashboard totals
    await updateFinanceDashboard();
};
```

**Finance Dashboard Impact**:
- Expenses automatically categorized under "Payroll"
- Monthly budget tracking includes HR costs
- Department cost allocation updated
- Cash flow projections adjusted

**Integration Points**:
- `/hr/payroll` → Creates finance expense entries
- Finance approval required before payment
- Payroll history synced with finance records

---

##3. Operations Integration

### Task Performance: Operations → HR

**Trigger**: Employee completes tasks/projects in Operations module

**Data Sync**:
```typescript
const updateEmployeePerformance = async (employeeId: string, taskData: Task) => {
    // Calculate performance score
    const completionRate = taskData.completed_on_time ? 100 : 80;
    const qualityScore = taskData.quality_rating * 20;
    
    // Update employee performance
    await supabase
        .from('employees')
        .update({
            performance_score: (completionRate + qualityScore) / 2
        })
        .eq('id', employeeId);
    
    // Update KPI if relevant
    await updateEmployeeKPI(employeeId, 'Task Completion', 1);
};
```

**HR Dashboard Impact**:
- Performance scores auto-update
- Department performance reflects task completion rates
- Attendance tracking from operations schedule

**Integration Points**:
- `/operations/schedule` → Attendance data
- Task completion → Performance metrics
- Resource allocation → Workload balancing

---

## 4. Customer Support Integration

### Agent Metrics: Support → HR

**Trigger**: Support agent resolves tickets, gets CSAT scores

**Data Sync**:
```typescript
const syncSupportMetrics = async (agentId: string, metrics: SupportMetrics) => {
    // Update employee KPIs
    await supabase
        .from('employee_kpis')
        .upsert({
            employee_id: agentId,
            kpi_name: 'Customer Satisfaction',
            current_value: metrics.avg_csat,
            target_value: 4.5,
            achievement_rate: (metrics.avg_csat / 4.5) * 100
        });
    
    // Update tickets resolved KPI
    await supabase
        .from('employee_kpis')
        .upsert({
            employee_id: agentId,
            kpi_name: 'Tickets Resolved',
            current_value: metrics.tickets_resolved,
            target_value: metrics.ticket_target,
            achievement_rate: (metrics.tickets_resolved / metrics.ticket_target) * 100
        });
};
```

**HR Dashboard Impact**:
- Support agent performance visible in HR
- CSAT scores contribute to overall employee score
- SLA compliance tracked as KPI

**Integration Points**:
- `/customer-success/performance` → HR Performance Dashboard
- Agent metrics → Employee profiles
- Workload data → HR resource planning

---

## 5. Notification System Integration

### HR Notifications (Already integrated with existing NotificationContext)

**Leave Request Notifications**:
```typescript
// When employee submits leave
const { addNotification } = useNotifications();

addNotification({
    type: 'leave_request',
    title: 'New Leave Request',
    message: `${employeeName} requested ${days} days leave`,
    priority: 'high',
    link: `/hr/leave`,
    channels: ['email', 'whatsapp', 'in_app']
});
```

**Commission Eligibility Alerts**:
```typescript
// When employee meets commission threshold
addNotification({
    type: 'commission_alert',
    title: 'Commission Eligible Employee',
    message: `${employeeName} has met KPI targets - ${commissionAmount} EGP eligible`,
    priority: 'high',
    link: `/hr/performance`,
    recipients: ['hr_manager', 'finance_manager']
});
```

**Payroll Notifications**:
```typescript
// When payroll is ready
addNotification({
    type: 'payroll_ready',
    title: 'Payslip Available',
    message: 'Your payslip for December 2024 is ready',
    priority: 'medium',
    link: `/hr/payroll`,
    channels: ['email']
});
```

**Performance Review Alerts**:
```typescript
// Quarterly review due
addNotification({
    type: 'review_due',
    title: 'Performance Review Due',
    message: 'Your quarterly review is scheduled for Dec 20',
    priority: 'medium',
    link: `/hr/employees/${employeeId}`
});
```

---

## 6. Webhook Integration

### External System Triggers

**TeraBox Link**: `/tech-panel/webhooks`

**Webhook Events**:
1. `employee.created` - New employee added
2. `employee.updated` - Employee data changed
3. `leave.requested` - Leave request submitted
4. `leave.approved` - Leave approved/rejected
5. `payroll.processed` - Monthly payroll completed
6. `kpi.achieved` - Employee meets KPI target
7. `commission.eligible` - Commission threshold reached

**Example Webhook Payload**:
```json
{
    "event": "kpi.achieved",
    "timestamp": "2024-12-11T00:00:00Z",
    "data": {
        "employee_id": "123",
        "employee_name": "Ahmed Hassan",
        "kpi_name": "Revenue Target",
        "achievement_rate": 105,
        "commission_eligible": true,
        "commission_amount": 15000
    }
}
```

---

## 7. Real-Time Data Sync Strategy

### Supabase Realtime Subscriptions

```typescript
// Subscribe to employee changes
const employeeSubscription = supabase
    .channel('employee_changes')
    .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'employees'
    }, (payload) => {
        // Update UI instantly
        refreshEmployeeData();
    })
    .subscribe();

// Subscribe to KPI updates
const kpiSubscription = supabase
    .channel('kpi_updates')
    .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'employee_kpis'
    }, (payload) => {
        // Refresh performance dashboard
        refreshPerformanceData();
    })
    .subscribe();
```

---

## 8. Data Consistency Rules

### Master Data Sources

| Data Type | Master Source | Sync Direction |
|-----------|---------------|----------------|
| Employee Info | HR Module | HR → All |
| Sales KPIs | Sales Module | Sales → HR |
| Payroll | HR Module | HR → Finance |
| Attendance | Operations | Operations → HR |
| Support Metrics | Customer Success | Support → HR |
| Performance Scores | HR Module (aggregated) | All → HR |

---

## 9. Implementation Checklist

### Phase 1: Sales Integration
- [ ] Create employee_kpis table triggers
- [ ] Set up real-time sync from deals to KPIs
- [ ] Implement commission threshold alerts
- [ ] Test: Close deal → See KPI update in HR

### Phase 2: Finance Integration
- [ ] Create payroll → expenses sync function
- [ ] Set up approval workflow
- [ ] Implement payslip generation
- [ ] Test: Process payroll → See in Finance

### Phase 3: Operations Integration
- [ ] Sync task completion to performance scores
- [ ] Integrate attendance tracking
- [ ] Link schedule to leave conflicts
- [ ] Test: Complete task → Performance update

### Phase 4: Support Integration
- [ ] Sync CSAT scores to employee KPIs
- [ ] Track ticket resolution rates
- [ ] Monitor SLA compliance
- [ ] Test: Resolve ticket → HR metrics update

### Phase 5: Notifications
- [x] Use existing NotificationContext
- [ ] Add HR-specific notification types
- [ ] Implement email/WhatsApp/Telegram triggers
- [ ] Test: Leave request → Manager notified

### Phase 6: Webhooks
- [x] Webhooks infrastructure exists in Tech Panel
- [ ] Configure HR-specific webhook events
- [ ] Test external system integrations
- [ ] Monitor webhook delivery

---

## 10. Testing Matrix

| Integration | Test Scenario | Expected Result |
|-------------|---------------|-----------------|
| **Sales → HR** | Close deal worth 100K EGP | KPI updated, commission alert if threshold met |
| **HR → Finance** | Process December payroll | Expenses created in Finance, total updated |
| **Operations → HR** | Complete 5 tasks on time | Performance score increases |
| **Support → HR** | Resolve 10 tickets with 4.8 CSAT | Employee KPI shows achievement |
| **Notifications** | Submit leave request | Manager gets email + in-app notification |
| **Webhooks** | Employee achieves KPI | External system receives webhook |

---

## 11. Performance Optimization

### Caching Strategy
- Cache employee list for 5 minutes
- Cache KPI data for 1 minute
- Cache department stats for 10 minutes
- Invalidate on relevant updates

### Batch Operations
- Process payroll in batches of 10
- Sync KPIs daily at midnight
- Generate reports asynchronously

---

## Status: ✅ Integration Framework Ready

All integration points are documented and ready for backend implementation. The UI components are built and will automatically reflect data changes once Supabase connections are established.

**Next Steps**:
1. Create database triggers for auto-sync
2. Implement webhook endpoints
3. Connect notification channels (Email/WhatsApp)
4. Test end-to-end flows
5. Deploy to staging for UAT
