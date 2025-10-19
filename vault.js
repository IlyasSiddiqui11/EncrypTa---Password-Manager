const table = document.querySelector(".vault-table");
const website = document.getElementById("website");
const username = document.getElementById("username");
const password = document.getElementById("password");
const btn = document.querySelector("#submit-btn");

const getStored = () => JSON.parse(localStorage.getItem("passwords") || "[]");
const saveStored = (arr) => localStorage.setItem("passwords", JSON.stringify(arr));

function showPasswords() {
    const arr = getStored();

    const header = `<tr>
    <th>Website</th>
    <th>Username</th>
    <th>Password</th>
    <th>Actions</th>
    </tr>`;

    if (!arr.length) {
        table.innerHTML = header + `<tr><td colspan="4" class = "no-data-to-show "style="text-align:center;padding:1rem;color:#ddd">No Data To Show</td></tr>`;
        return;
    }

    let rows = "";
    arr.forEach((el, i) => {
        const safeWebsite = String(el.website).replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const safeUsername = String(el.username).replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const masked = "•".repeat(Math.min(8, String(el.password).length || 8));
        rows += `<tr>
        <td>${safeWebsite}</td>
        <td>${safeUsername}</td>
        <td>${masked}</td>
        <td>
            <button class="copy-btn" data-index="${i}" title="Copy">📋</button>
            <button class="delete-btn" data-index="${i}" title="Delete">🗑️</button>
        </td>
    </tr>`;
    });

    table.innerHTML = header + rows;
}

function deleteByIndex(index) {
    const arr = getStored();
    if (!Number.isInteger(index) || index < 0 || index >= arr.length) return;
    arr.splice(index, 1);
    saveStored(arr);
    showPasswords();
}

async function copyText(text) {
    if (!text) return Promise.reject(new Error("Nothing to copy"));
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    }
    // fallback
    return new Promise((resolve, reject) => {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        try {
            const ok = document.execCommand("copy");
            document.body.removeChild(ta);
            if (ok) resolve();
            else reject(new Error("execCommand failed"));
        } catch (err) {
            document.body.removeChild(ta);
            reject(err);
        }
    });
}

// initial render
console.log("Working");
showPasswords();

// add / submit handler
if (btn) {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        const w = (website?.value || "").trim();
        const u = (username?.value || "").trim();
        const p = (password?.value || "").trim();
        if (!w || !u || !p) {
            alert("Fill all fields.");
            return;
        }
        const arr = getStored();
        arr.push({ website: w, username: u, password: p });
        saveStored(arr);
        showPasswords();
        website.value = "";
        username.value = "";
        password.value = "";
    });
}

// event delegation for action buttons (copy, delete)
table.addEventListener("click", async (e) => {
    const btnEl = e.target.closest("button");
    if (!btnEl) return;
    const idx = Number(btnEl.dataset.index);
    const arr = getStored();

    if (btnEl.classList.contains("copy-btn")) {
        if (!Number.isFinite(idx) || !arr[idx]) return;
        try {
            await copyText(arr[idx].password);
            const prev = btnEl.innerText;
            btnEl.innerText = "Copied";
            setTimeout(() => { btnEl.innerText = prev; }, 1300);
        } catch (err) {
            alert("Unable to copy. Use view to see the password.");
            console.error(err);
        }
        return;
    }

    if (btnEl.classList.contains("delete-btn")) {
        if (!Number.isFinite(idx) || !arr[idx]) return;
        deleteByIndex(idx);
        return;
    }
});