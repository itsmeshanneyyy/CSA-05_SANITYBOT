isLoading = false;

function loading(to = "login") {
    if (!isLoading) {
        window.location.href = "http://localhost:5000/loading"
        setTimeout(() => { window.location.href = `http://localhost:5000/${to}`; isLoading = true; }, 5000)
    }
}

loading("welcome")

function redirect(to) {

}