// public/script.js
const apiBase = "/api/stores";

console.log('✅ script.js loaded');
console.log('📍 API Base:', apiBase);

// ==================== VALIDATION FUNCTIONS ====================

function validateCode(code) {
  return /^[0-9]+$/.test(code);
}

function validateName(name) {
  return /^[A-Za-z\s]+$/.test(name);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateMobile(mobile) {
  return /^[0-9]{10}$/.test(mobile);
}

function clearErrors() {
  document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
}

function validateForm() {
  clearErrors();
  let isValid = true;

  const code = document.getElementById("crudCode").value.trim();
  const designation = document.getElementById("crudDesignation").value;
  const manager = document.getElementById("crudManager").value.trim();
  const email = document.getElementById("crudEmail").value.trim();
  const mobile = document.getElementById("crudMobile").value.trim();

  if (!code || !validateCode(code)) {
    document.getElementById("codeError").textContent = "Numbers only required";
    isValid = false;
  }

  if (!designation) {
    isValid = false;
    alert("Please select a designation");
  }

  if (!manager || !validateName(manager)) {
    document.getElementById("managerError").textContent = "Alphabets only required";
    isValid = false;
  }

  if (!email || !validateEmail(email)) {
    document.getElementById("emailError").textContent = "Valid email required";
    isValid = false;
  }

  if (!mobile || !validateMobile(mobile)) {
    document.getElementById("mobileError").textContent = "10 digit number required";
    isValid = false;
  }

  return isValid;
}

// ==================== SEARCH STORE ====================

async function findStore() {
  const code = document.getElementById("storeCode").value.trim();
  const result = document.getElementById("result");
  
  if (!code) {
    result.innerHTML = "⚠️ Please enter a store code";
    return;
  }

  try {
    console.log('🔍 Searching for store:', code);
    const res = await fetch(`${apiBase}/${code}`);
    const data = await res.json();
    
    if (data.success) {
      const s = data.store;
      result.innerHTML = `
        ✅ <strong>${s.designation} ${s.manager}</strong><br>
        📧 ${s.email} | 📱 ${s.mobile} | 🏪 ${s.store_type}
      `;
      console.log('✅ Store found:', s);
    } else {
      result.innerHTML = "❌ Store not found";
      console.log('❌ Store not found');
    }
  } catch (err) {
    console.error('❌ Search error:', err);
    result.innerHTML = "❌ Error searching store";
  }
}

// ==================== ADD STORE ====================

async function addStore() {
  console.log('➕ Attempting to add store...');
  
  if (!validateForm()) {
    alert("Please fix all validation errors");
    return;
  }

  const code = document.getElementById("crudCode").value.trim();
  const designation = document.getElementById("crudDesignation").value;
  const manager = document.getElementById("crudManager").value.trim();
  const email = document.getElementById("crudEmail").value.trim();
  const mobile = document.getElementById("crudMobile").value.trim();
  const storeType = document.querySelector('input[name="storeType"]:checked').value;

  const storeData = { code, designation, manager, email, mobile, storeType };
  console.log('📦 Store data:', storeData);

  try {
    const res = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(storeData),
    });
    const data = await res.json();
    
    console.log('📨 Response:', data);
    alert(data.message);
    
    if (data.success) {
      clearForm();
      loadStores();
    }
  } catch (err) {
    console.error('❌ Add error:', err);
    alert("❌ Error adding store");
  }
}

function clearForm() {
  document.getElementById("crudCode").value = "";
  document.getElementById("crudDesignation").value = "";
  document.getElementById("crudManager").value = "";
  document.getElementById("crudEmail").value = "";
  document.getElementById("crudMobile").value = "";
  document.querySelector('input[name="storeType"][value="store"]').checked = true;
  clearErrors();
}

// ==================== LOAD ALL STORES ====================

async function loadStores() {
  const list = document.getElementById("storeList");
  
  try {
    console.log('📊 Loading all stores...');
    const res = await fetch(apiBase);
    const stores = await res.json();

    console.log('📦 Stores received:', stores.length);

    if (!stores || stores.length === 0) {
      list.innerHTML = '<div class="empty-state">📭<br>No stores found. Add your first store above!</div>';
      return;
    }

    list.innerHTML = stores.map(s => `
      <li class="store-item" 
          data-code="${s.code}" 
          data-designation="${s.designation}" 
          data-manager="${s.manager}" 
          data-email="${s.email}" 
          data-mobile="${s.mobile}" 
          data-type="${s.store_type}">
        <div class="store-header">
          <span class="store-code">#${s.code}</span>
          <span class="store-type-badge badge-${s.store_type}">${s.store_type}</span>
        </div>
        <div class="store-details">
          <div class="detail-item">
            <span class="detail-label">Manager</span>
            <span class="detail-value">${s.designation} ${s.manager}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Email</span>
            <span class="detail-value">${s.email}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Mobile</span>
            <span class="detail-value">${s.mobile}</span>
          </div>
        </div>
        <div class="store-actions">
          <button class="btn-icon btn-edit-icon" data-code="${s.code}">✏️ Edit</button>
          <button class="btn-icon btn-delete-icon" data-code="${s.code}">🗑️ Delete</button>
        </div>
      </li>
    `).join("");

    // Attach event listeners
    list.querySelectorAll('.btn-edit-icon').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const li = e.currentTarget.closest('.store-item');
        enterInlineEdit(li);
      });
    });

    list.querySelectorAll('.btn-delete-icon').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const code = e.currentTarget.dataset.code;
        if (confirm(`Are you sure you want to delete store "${code}"?`)) {
          deleteStore(code);
        }
      });
    });

    console.log('✅ Stores loaded successfully');
  } catch (err) {
    console.error('❌ Load stores error:', err);
    list.innerHTML = '<div class="empty-state">❌ Error loading stores</div>';
  }
}

// ==================== INLINE EDIT MODE ====================

function enterInlineEdit(li) {
  const code = li.dataset.code;
  const designation = li.dataset.designation;
  const manager = li.dataset.manager;
  const email = li.dataset.email;
  const mobile = li.dataset.mobile;
  const storeType = li.dataset.type;

  console.log('✏️ Entering edit mode for store:', code);

  li.innerHTML = `
    <div class="inline-edit">
      <div class="inline-edit-grid">
        <div class="form-group">
          <label>Store Code</label>
          <input type="text" value="${code}" disabled />
        </div>
        <div class="form-group">
          <label>Designation</label>
          <select id="editDesignation">
            <option value="Mr" ${designation === 'Mr' ? 'selected' : ''}>Mr</option>
            <option value="Mrs" ${designation === 'Mrs' ? 'selected' : ''}>Mrs</option>
            <option value="Miss" ${designation === 'Miss' ? 'selected' : ''}>Miss</option>
            <option value="Dr" ${designation === 'Dr' ? 'selected' : ''}>Dr</option>
            <option value="Ms" ${designation === 'Ms' ? 'selected' : ''}>Ms</option>
          </select>
        </div>
        <div class="form-group">
          <label>Manager Name</label>
          <input type="text" id="editManager" value="${manager}" pattern="[A-Za-z\s]+" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="editEmail" value="${email}" />
        </div>
        <div class="form-group">
          <label>Mobile</label>
          <input type="tel" id="editMobile" value="${mobile}" pattern="[0-9]{10}" maxlength="10" />
        </div>
        <div class="form-group">
          <label>Type</label>
          <div class="radio-group">
            <label><input type="radio" name="editType" value="store" ${storeType === 'store' ? 'checked' : ''} /> Store</label>
            <label><input type="radio" name="editType" value="branch" ${storeType === 'branch' ? 'checked' : ''} /> Branch</label>
          </div>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-success" onclick="updateStore('${code}', this.closest('.store-item'))">Update</button>
        <button class="btn btn-danger" onclick="deleteStore('${code}')">Delete</button>
        <button class="btn btn-secondary" onclick="loadStores()">Cancel</button>
      </div>
    </div>
  `;
}

// ==================== UPDATE STORE ====================

async function updateStore(code, li) {
  console.log('✏️ Attempting to update store:', code);

  const designation = li.querySelector('#editDesignation').value;
  const manager = li.querySelector('#editManager').value.trim();
  const email = li.querySelector('#editEmail').value.trim();
  const mobile = li.querySelector('#editMobile').value.trim();
  const storeType = li.querySelector('input[name="editType"]:checked').value;

  // Validation
  if (!validateName(manager)) {
    alert("Manager name must contain only alphabets");
    return;
  }
  if (!validateEmail(email)) {
    alert("Please enter a valid email");
    return;
  }
  if (!validateMobile(mobile)) {
    alert("Mobile number must be exactly 10 digits");
    return;
  }

  const updateData = { designation, manager, email, mobile, storeType };
  console.log('📦 Update data:', updateData);

  try {
    const res = await fetch(`${apiBase}/${code}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    const data = await res.json();
    
    console.log('📨 Response:', data);
    alert(data.message);
    loadStores();
  } catch (err) {
    console.error('❌ Update error:', err);
    alert("❌ Error updating store");
  }
}

// ==================== DELETE STORE ====================

async function deleteStore(code) {
  console.log('🗑️ Attempting to delete store:', code);

  try {
    const res = await fetch(`${apiBase}/${code}`, { method: "DELETE" });
    const data = await res.json();
    
    console.log('📨 Response:', data);
    alert(data.message);
    loadStores();
  } catch (err) {
    console.error('❌ Delete error:', err);
    alert("❌ Error deleting store");
  }
}

// ==================== INITIALIZE ====================

window.onload = function() {
  console.log('🔄 Window loaded, initializing...');
  loadStores();
};