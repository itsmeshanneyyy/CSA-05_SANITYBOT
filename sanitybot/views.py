from flask import Blueprint, render_template, url_for,  request, flash, redirect
from nltk.featstruct import _trace_unify_fail
from werkzeug.utils import redirect
from .models import Admin, User, User_health, ChatHistory
from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_required, current_user
from datetime import date
from flask import session


views = Blueprint('views', __name__)

# homepage


@views.route('/home',  methods=['GET', 'POST'])
@login_required
def home():
    if request.method == 'POST':
        firstname = request.form.get('firstname')
        middlename = request.form.get('middlename')
        lastname = request.form.get('lastname')
        address = request.form.get('address')
        contact = request.form.get('contact')
        date_submit = date.today()
        condition = request.form.get('condition')

    else:
        # Get logged in user
        user = current_user
        return render_template('home.html', user=user)

# user profile


@views.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    if request.method == "POST":
        id = request.form['id']

        user = User.query.filter_by(id=id).first()
        user.firstname = request.form['firstname']
        user.middlename = request.form['middlename']
        user.lastname = request.form['lastname']
        user.address = request.form['address']
        user.contact = request.form['contact']
        user.email = request.form['email']

        # update database
        try:
            db.session.commit()
            flash('Update successfully!', category='success')
            return redirect(url_for('views.profile'))
        except:
            return 'ERROR'
    else:
        # Get logged in user
        user = current_user
        return render_template('userprofile.html', user=user)

# edit user profile security


@views.route('/profileupdate', methods=['GET', 'POST'])
def profile_security():
    if request.method == "POST":
        user = current_user
        pword = request.form['newpassword']
        rpword = request.form['retypepass']

        if pword != rpword:
            flash('Password and Retype password does not match.', category='error')
            return redirect(url_for('views.profile_security'))
        else:
            user = User.query.filter_by(id=user.id).first()
            user.password = generate_password_hash(pword, method='sha256')

            # update database
            try:
                db.session.commit()
                flash('Update successfully!', category='success')
                return redirect(url_for('views.profile'))
            except:
                return 'ERROR'
    else:
        # Get logged in user
        user = current_user
        return render_template('changepassword.html', user=user)

# ADMIN HOME DASHBOARD


@views.route('/dashboard', methods=['GET', 'POST'])
def dashboard():
    users = User.query.all()
    return render_template("controlpanel.html", users=users)

# ADMIN PROFILE


@views.route('/adminprofile',  methods=['GET', 'POST'])
def admin_profile():
    if request.method == 'POST':
        username = request.form.get('uname')
        email = request.form.get('email')
        pword = request.form.get('pword')
        cpword = request.form.get('re-pword')

        user = Admin.query.filter_by(email=email).first()
        if user:
            flash('Email already exists. Try other email.', category='error')
        elif pword != cpword:
            flash('Password and confirm password does not match.', category='error')
        else:
            new_user = Admin(username=username, email=email,
                             password=generate_password_hash(pword, method='sha256'))
            db.session.add(new_user)
            db.session.commit()
            # login_user(user, remember=True)
            flash('Admin account added!', category='success')
            return redirect(url_for('views.admin_profile'))

    users = Admin.query.all()
    return render_template("admin_manageaccounts.html", users=users)

# ADMIN edit profile


@views.route('/edit/<int:id>', methods=['GET', 'POST'])
def edit(id):
    user = Admin.query.get_or_404(id)
    if request.method == 'POST':
        user.username = request.form['uname']
        user.email = request.form['email']
        password = request.form['pword']
        rpword = request.form['re-pword']

        if password != rpword:
            flash('Password and Retype password does not match.', category='error')
            return redirect(url_for('views.admin_profile'))
        else:
            user = Admin.query.get_or_404(id)
            user.password = generate_password_hash(password, method='sha256')

        # update database
            try:
                db.session.commit()
                flash('Update successfully!', category='success')
                return redirect(url_for('views.admin_profile'))
            except:
                return 'ERROR'
    else:
        return render_template('editAdmin.html', user=user)

# ADMIN patient info


@views.route('/patientprofile', methods=['GET', 'POST'])
def admin_patients():
    users = User.query.all()
    return render_template("admin_patients.html", users=users)

# DELETE


@views.route('/delete/<int:id>')
def delete(id):
    user = Admin.query.get_or_404(id)

    try:
        db.session.delete(user)
        db.session.commit()
        return redirect(url_for('views.admin_profile'))
    except:
        return 'Error'


@views.route('/search')
def search():
    if request.method == 'POST':
        users = User.query.all()
        search_value = request.form['search']
        search = "%{0}%".format(search_value)
        results = users.query.filter(users.firstname.like(search)).all()
        return render_template("admin_patients.html", users=results)
    else:
        # Get logged in user
        user = current_user
        return render_template("admin_patients.html", users=user)


@views.route('/chat', methods=['GET', 'POST'])
def chat():
    user = current_user
    return render_template('chat.html', data={'user': user})


@views.route('/', methods=['GET', 'POST'])
def welcome():
    user = current_user
    return render_template('welcomepage.html', user=user)


@views.route('/postpartum', methods=['GET', 'POST'])
def postpartum():
    user = current_user
    return render_template('postpartum.html', user=user)


@views.route('/sanity', methods=['GET', 'POST'])
def sanity():
    user = current_user
    return render_template('sanity.html', user=user)


@views.route('/aboutpostpartum', methods=['GET', 'POST'])
def aboutpostpartum():
    user = current_user
    return render_template('about_postpartum.html', user=user)


@views.route('/welcomeback', methods=['GET', 'POST'])
def home2():
    user = current_user
    return render_template('home2.html', user=user)


@views.route('/loading', methods=['GET', 'POST'])
def loading():
    return render_template('splash_screen.html')


@views.route('/selfhelp', methods=['GET', 'POST'])
def selfhelp():
    user = current_user
    return render_template('selfhelp.html', user=user)
