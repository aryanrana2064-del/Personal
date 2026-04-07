const SUPABASE_URL = "https://kmgnfgngtzxlxyjzboqg.supabase.co";
const SUPABASE_KEY = "sb_publishable_1eqT_P96Ee8DNfZL4zduvg_Nwr11o1s";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 👁️ PASSWORD TOGGLE
function togglePass(id){
    let input = document.getElementById(id);
    input.type = input.type === "password" ? "text" : "password";
}

// 🔐 SIGNUP
async function signup(){
    let email = document.getElementById("signupEmail").value;
    let pass = document.getElementById("signupPass").value;

    let { error } = await supabaseClient.auth.signUp({
        email: email,
        password: pass
    });

    alert(error ? error.message : "Signup Success");
}

// 🔐 LOGIN
async function login(){
    let email = document.getElementById("loginEmail").value;
    let pass = document.getElementById("loginPass").value;

    let { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: pass
    });

    if(!error){
        localStorage.setItem("user", data.user.email);
        window.location.href = "dashboard.html";
    } else {
        alert(error.message);
    }
}

// 🔢 OTP LOGIN
async function sendOTP(){
    let email = document.getElementById("loginEmail").value;

    let { error } = await supabaseClient.auth.signInWithOtp({
        email: email
    });

    alert(error ? error.message : "OTP Sent");
}

// 🚪 LOGOUT
async function logout(){
    await supabaseClient.auth.signOut();
    window.location.href = "index.html";
}

// 📊 DASHBOARD LOGIC
let user = localStorage.getItem("user");
let data = [];
let persons = [];

async function loadData(){
    let { data: result } = await supabaseClient
        .from("work")
        .select("*")
        .eq("user", user);

    data = result || [];
    renderData();
}

function addPerson(){
    let name = document.getElementById("personName").value;
    let salary = parseInt(document.getElementById("salary").value) || 200;

    persons.push({name, salary});
    renderPersons();
}

function renderPersons(){
    let html = "";
    persons.forEach(p=>{
        html += `<option>${p.name}</option>`;
    });
    document.getElementById("personSelect").innerHTML = html;
}

function getSalary(name){
    let p = persons.find(x=>x.name===name);
    return p ? p.salary : 200;
}

async function addWork(){
    let now = new Date();
    let name = document.getElementById("personSelect").value;

    await supabaseClient.from("work").insert([{
        user,
        name,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        status: "Work",
        earning: getSalary(name)
    }]);

    loadData();
}

async function addLeave(){
    let now = new Date();
    let name = document.getElementById("personSelect").value;

    await supabaseClient.from("work").insert([{
        user,
        name,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        status: "Leave",
        earning: 0
    }]);

    loadData();
}

function renderData(){
    let html = "";
    let total = 0;

    data.forEach(d=>{
        total += d.earning;

        html += `
        <tr>
            <td>${d.name}</td>
            <td>${d.date}</td>
            <td>${d.time}</td>
            <td>${d.status}</td>
            <td>₹${d.earning}</td>
        </tr>`;
    });

    document.getElementById("data").innerHTML = html;
    document.getElementById("total").innerText = "₹" + total;
}

// Auto load dashboard
if(window.location.pathname.includes("dashboard.html")){
    loadData();
}
