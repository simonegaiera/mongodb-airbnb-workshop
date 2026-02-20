---
title: "Admin Portal"
permalink: /sa/admin-portal/
layout: single
classes: wide
---

The MongoDB Arena Admin Portal provides comprehensive management tools for workshop administrators to monitor participants, manage the leaderboard, and maintain the workshop environment.

---

## 🔐 Accessing the Admin Portal

The admin portal is accessible at `/admin` on your workshop portal URL (e.g., `https://your-workshop-url.com/admin`).

**Authentication:**
- The portal is protected by a password configured in the environment variable `NEXT_PUBLIC_ADMIN_PASSWORD`
- Authentication persists for the browser session using `sessionStorage`
- If no admin password is set, the portal redirects to the home page

---

## 📊 Admin Portal Features

The admin portal consists of five main sections accessible via a sidebar navigation:

### 1. User Progress Monitor 📊

**Purpose:** Real-time monitoring of participant activity and progress during the workshop.

**Features:**
- **Live Dashboard:** Auto-refreshes every 30 seconds to show current participant status
- **Status Tracking:**
  - 🟢 **Active:** Participants who have submitted exercises recently
  - 🔴 **Stuck:** Participants who haven't submitted in a while (may need help)
  - 🟡 **Not Started:** Participants who haven't completed any exercises yet
- **Summary Statistics:** Quick overview of stuck, not started, and active participants
- **Search & Filter:** Find specific users or filter by status
- **Detailed Information:**
  - Participant name and username
  - Number of exercises completed
  - Last exercise submitted
  - Time since last activity

**Use Case:** Identify participants who may need assistance during the workshop and track overall engagement.

---

### 2. Leaderboard Exclusion 🚫

**Purpose:** Manage which participants appear on the public leaderboard.

**Features:**
- **Participant Management:**
  - View all active participants with their IDs and names
  - Exclude or include participants from the public leaderboard
  - Search by user ID or name
  - Toggle visibility of decommissioned participants
- **Statistics Dashboard:**
  - Total active participants
  - Number of included participants
  - Number of excluded participants
- **Pagination:** Handle large participant lists with configurable items per page (10, 20, 50, 100)
- **Individual Actions:** Exclude or include participants with a single click
- **Status Indicators:**
  - 🟢 Included (visible on leaderboard)
  - 🔴 Excluded (hidden from leaderboard)
  - Decommissioned badge for inactive accounts

**Use Case:** Exclude test accounts, MongoDB employees, or participants who shouldn't compete for prizes.

---

### 3. Leaderboard Freeze 🕐

**Purpose:** Set a deadline after which submissions will no longer count toward the leaderboard.

**Features:**
- **Timezone Support:** Select from 14 common timezones worldwide
- **Date/Time Input:**
  - Year, Month, Day fields
  - 12-hour time format (Hour, Minute, AM/PM)
  - Automatic conversion to UTC for storage
- **Quick Actions:**
  - "Set to Now" button for immediate freeze
  - Current freeze date display with timezone
- **Validation:** Ensures valid date ranges and formats
- **Visual Feedback:** Success/error messages for all operations

**Supported Timezones:**
- UTC, EST/EDT, CST/CDT, MST/MDT, PST/PDT
- BRT (São Paulo), GMT/BST (London), CET/CEST (Paris)
- TRT (Istanbul), GST (Dubai), IST (Mumbai)
- CST (Beijing), JST (Tokyo), AEST/AEDT (Sydney)

**Use Case:** Set a competition deadline to ensure fair scoring and prevent late submissions from affecting final rankings.

---

### 4. Download Data 📥

**Purpose:** Export workshop data for analysis, reporting, and record-keeping.

**Features:**
- **Two-File Export:**
  1. **User List CSV:**
     - User ID and display name
     - Email addresses (admin-only data)
     - Number of exercises solved
  2. **Competition Results CSV:**
     - Rankings with user IDs and names
     - Points/scores or completion times
     - Exercise counts and timestamps
- **One-Click Download:** Both files download automatically with a single button click
- **Automatic Naming:** Files include timestamps for easy organization
- **Error Handling:** Clear error messages if downloads fail

**Use Case:** Generate reports for stakeholders, analyze workshop performance, or maintain records of participant achievements.

---

### 5. Database Restore 🔄

**Purpose:** Reset participant databases to their original state for troubleshooting or retries.

**Features:**
- **Selective Restore:**
  - Restore individual participants with single-click action
  - Bulk restore multiple participants using checkboxes
  - "Select All" option for mass operations
- **Safety Confirmations:** Confirmation dialogs prevent accidental resets
- **Search & Filter:**
  - Find specific participants by ID or name
  - Toggle visibility of decommissioned accounts
- **Statistics:**
  - Total participants count
  - Number of selected participants for restore
  - Filtered results count
- **Pagination:** Same flexible pagination as other sections
- **Status Feedback:** Success/error messages for all restore operations

**Use Case:** Help participants who encounter database issues or want to restart exercises from scratch.

---

## 🎯 Best Practices

1. **Monitor Progress Regularly:** Check the User Progress Monitor during workshops to identify stuck participants
2. **Set Freeze Date Early:** Configure the leaderboard freeze date at the start of the workshop
3. **Exclude Test Accounts:** Use Leaderboard Exclusion to hide internal testing and demo accounts
4. **Download Data Before Destroy:** Always export data before destroying workshop infrastructure
5. **Use Restore Carefully:** Database restore is irreversible - always confirm before proceeding
6. **Session Management:** Admin authentication expires when the browser session ends


---

For additional support, join the **[#ai-arena](https://mongodb.enterprise.slack.com/archives/C08JJKV3T0A)** Slack channel.

