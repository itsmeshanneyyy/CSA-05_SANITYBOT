import re
from flask import Blueprint, render_template, url_for,  request, flash, redirect
from werkzeug.utils import redirect
from .models import Admin, User
from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, login_required, logout_user, current_user

auth = Blueprint('auth', __name__)



# USER LOGIN
@auth.route('/login', methods = ['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        user = User.query.filter_by(email=email).first()
        if user:
            if check_password_hash(user.password, password):
                login_user(user, remember=True)
                return redirect(url_for('views.home'))
            else:
                flash('Incorrect password, try again.', category='error')
        else:
            flash('Email does not exist.', category='error')
        
    return render_template("login.html", user=current_user)

# USER REGISTRATION
@auth.route('/register', methods = ['GET', 'POST'])
def register():   
    if request.method == 'POST':
        firstname = request.form.get('signup_first_name')
        middlename = request.form.get('signup_middle_name')
        lastname = request.form.get('signup_last_name')
        email = request.form.get('signup_email')
        address = request.form.get('signup_address')
        password = request.form.get('signup_password')
        cpassword = request.form.get('signup_cpassword')
        age = request.form.get('signup_age')
        marital = request.form.get('signup_marital')
        educ = request.form.get('signup_educ')
        employ = request.form.get('signup_employ')
        income = request.form.get('signup_income')
        sdp1 = request.form.get('sdp1')
        sdp2 = request.form.get('sdp2')
        sdp3 = request.form.get('sdp3')
        sdp4 = request.form.get('sdp4')
        sdp5 = request.form.get('sdp5')
        sdp6 = request.form.get('sdp6')
        sdp7 = request.form.get('sdp7')
        sdp8 = request.form.get('sdp8')
        sdp9 = request.form.get('sdp9')
        numpreg = request.form.get('signup_numpreg')
        livechild = request.form.get('signup_livechild')
        numpremature = request.form.get('signup_numpremature')
        nummiscarriage = request.form.get('signup_nummiscarriage')
        obscore = request.form.get('signup_obscore')
        comor = request.form.get('signup_comor')
        delivery = request.form.get('signup_delivery')
        pr1 = request.form.get('pr1')
        pr2 = request.form.get('pr2')
        pr3 = request.form.get('pr3')
        compli = request.form.get('signup_compli')
        ill = request.form.get('signup_ill')
        
        user = User.query.filter_by(email=email).first()
        if user:
            flash('Email already exists.', category='error')
        elif password != cpassword:
            flash('Password and confirm password does not match.', category='error')
        else:
            new_user = User(firstname=firstname, middlename=middlename, lastname=lastname, email=email, address=address, password=generate_password_hash(password, method='sha256'), age=age, marital=marital, educ=educ, employ=employ, income=income, sdp1=sdp1, sdp2=sdp2, sdp3=sdp3, sdp4=sdp4, sdp5=sdp5, sdp6=sdp6, sdp7=sdp7, sdp8=sdp8, sdp9=sdp9, numpreg=numpreg, livechild=livechild, numpremature=numpremature, nummiscarriage=nummiscarriage, obscore=obscore, comor=comor, delivery=delivery, pr1=pr1, pr2=pr2, pr3=pr3, compli=compli, ill=ill)
            
            db.session.add(new_user)
            db.session.commit()
            # login_user(user, remember=True)
            flash('Account created!', category='success')
            return redirect(url_for('auth.login'))

    return render_template("signup.html", user=current_user)

# FORGET PASSWORD - USER
@auth.route('/forgotpassword', methods = ['GET', 'POST'])
def forgotpassword(): 
    if request.method == "POST":
        email_text = request.form['emailr']
        pword = request.form['new_password']
        cpword = request.form['cpassword']

        if pword != cpword:
            flash('Password and Confirm password does not match.', category='error')
            return redirect(url_for('auth.forgotpassword'))
        else:
            user = User.query.filter_by(email=email_text).first()
            user.password = generate_password_hash(pword, method='sha256')
        
            # update database
            try:
                db.session.commit()
                flash('Update password successfully!', category= 'success')
                return redirect(url_for('auth.login'))
            except:
                return 'ERROR'
    else:
        return render_template("forgotpassword.html")


    

# LOGOUT USER
@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))


# ADMIN LOGIN
@auth.route('/adminlogin', methods = ['GET', 'POST'])
def admin():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        admin = Admin.query.filter_by(username=username).first()
        if admin:
            if check_password_hash(admin.password, password):
                login_user(admin, remember=True)
                return redirect(url_for('views.dashboard'))
            else:
                flash('Incorrect password, try again.', category='error')
        else:
            flash('Username does not exist.', category='error')
        
    return render_template("admin_login.html", user=current_user)

# LOGOUT ADMIN
@auth.route('/logoutadmin')
@login_required
def adminlogout():
    logout_user()
    return redirect(url_for('auth.admin'))


@auth.route('/login')
def signin():
    return render_template("login.html")