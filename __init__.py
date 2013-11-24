import os
from flask import Flask
from flask import render_template
from flask import request
from flask import make_response
from flask import session, redirect, url_for, escape
from requests_ips import RequestsIPS
app = Flask(__name__)

@app.route('/')
def index():
	# Test account:
	# email: moolbin@test
	# password: password
	# careId: PoMHRGodei
	# Tim's current hospital os info:
	# email: tim35050@gmail.com
	# password: berkeley
	# careId: Pov1SfSKlz
	# name: Timothy Meyers
	#date = {"year":2013,"month":1,"dayOfMonth":2,"hourOfDay":13,"minute":46,"second":45}
	#add_data('Pov1SfSKlz', 'DtQQwTwTEP', '78', date)
	return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
	if request.method == 'POST':
		if valid_login(request.form['email'], request.form['password']):
			result = get_user_login(request.form['email'], request.form['password'])
			if 'careId' in result:
				careId = result['careId']
				session['careId'] = careId
				return redirect(url_for('myapp'))
			else:
				error = 'Invalid username/password'
				return render_template('index.html', error=error)


@app.route('/app')
def myapp():
	if 'careId' in session:
		context = get_app_context()
		careId = session['careId']
		# UNCOMMENT THE FOLLOWING TO USE REAL DATA
		#name = get_data(careId, 'Ptn4kebAo9')['data']['value']
		#birthday = get_data(careId, 'Pt9nZWiTFa')['data']['value']
		#birthday = birthday.split(' ')[0]
		#gender = get_data(careId, 'PtDQzNlDgW')['data']['value']
		#if gender == '1':
		#	gender = "Male"
		#else:
		#	gender = "Female"
		#context['name'] = name
		#context['birthday'] = birthday
		#context['gender'] = gender
		context['name'] = "Timothy Meyers"
		context['birthday'] = "26-12-1986"
		context['gender'] = "Male"
		context['weight'] = 74.84
		context['height'] = 177.8

		return render_template('app.html', context = context)

def get_user_login(username, password):
	rips = RequestsIPS()
	result = rips.login(username, password)
	return result.json()

def register_new_user():
	rips = RequestsIPS()
	result = rips.add_new_user('tim35050@gmail.com', 'berkeley')
	if result:
		print "success"
	else:
		print result

def add_data(careId, key, value, date):
	rips = RequestsIPS()
	result = rips.add_data(careId, key, value, date)
	if result:
		print "success"
	else:
		print result

def get_data(careId, key):
	rips = RequestsIPS()
	result = rips.get_data(careId, key)
	return result.json()

def valid_login(username, password):
	return True

def log_the_user_in(username):
	pass

def get_app_context():

	vitals = []
	# Assume 4 vitals for now

	vital = {}
	vital['vital_id'] = 'bmi'
	vital['vital_name'] = 'BMI'
	vital['vital_subs'] = []
	vital['vital_icon_name'] = 'bmi-icon.png'
	vital['vital_values'] = [27] #[21.26]
	vital['vital_values_sep'] = ''
	vital['vital_unit'] = 'kg/m&#178;'
	vitals.append(vital)

	vital = {}
	vital['vital_id'] = 'cholesterol'
	vital['vital_name'] = 'Cholesterol'
	vital['vital_subs'] = ['Total', 'LDL']
	vital['vital_icon_name'] = 'cholesterol-icon.png'
	vital['vital_values'] = [230, 136]
	vital['vital_values_sep'] = '/'
	vital['vital_unit'] = 'mg/dL'
 	vitals.append(vital)

 # 	vital = {}
	# vital['vital_id'] = 'bloodglucose'
	# vital['vital_name'] = 'Blood glucose level'
	# vital['vital_icon_name'] = 'bloodglucose-icon.png'
	# vital['vital_values'] = [170]
	# vital['vital_values_sep'] = ''
	# vital['vital_unit'] = 'mg/dL'
	# context.append(vital)

	vital = {}
	vital['vital_id'] = 'bloodpressure'
	vital['vital_name'] = 'Blood pressure'
	vital['vital_subs'] = ['Systolic', 'Diastolic']
	vital['vital_icon_name'] = 'bloodpressure-icon.png'
	vital['vital_values'] = [110, 70] #[139, 94]
	vital['vital_values_sep'] = '/'
	vital['vital_unit'] = 'mmHg'
 	vitals.append(vital)

	context = {}
	context['vitals'] = vitals
 	return context

app.secret_key = '*\xd6\xe8T\xd7\xdc9\xcb\xbb\x9e/\xc1\xf5\xbas\x94s\xb6,\xbaB\xfcS!'

if __name__ == '__main__':
	port = int(os.environ.get("PORT", 5000))
	app.debug = True
	app.run(host='0.0.0.0', port=port)