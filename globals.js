let currentTenant = null;
let currentUserRole = "owner";
let currentRevenueOfficer = null;
let myChart = null;
let currentLoginMode = "unified";
let activeCategoryFilter = "all";
let currentBuyer = null;
window.mainCart = [];
window.buyerCartData = [];

let emailVerificationCode = "";
let pendingRegistrationData = null;
let pendingRegType = null;
let onVerifySuccess = null;
let tempStaffForms = [];

function setCategoryFilter(cat) {
    activeCategoryFilter = cat;
    renderBuyerCatalog();
}

