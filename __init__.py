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
	#if 'careId' in session:
		#return redirect(url_for('myhealth'))
	#else:
		return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
	if request.method == 'POST':
		if valid_login(request.form['email'], request.form['password']):
			#result = get_user_login(request.form['email'], request.form['password'])
			result = {'careId': 1}
			if 'careId' in result:
				careId = result['careId']
				session['careId'] = careId
				return redirect(url_for('myhealth'))
			else:
				error = 'Invalid username/password'
				return render_template('index.html', error=error)


@app.route('/myhealth')
def myhealth():
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
		context['name'] = "Theerapat Yangyuenthanasan"
		context['years'] = "26"
		context['gender'] = "Male"
		context['weight'] = 74.84
		context['height'] = 177.8

		return render_template('app.html', context = context)
	else:
		return render_template('index.html')

@app.route('/community')
def community():
	if 'careId' in session:
		return render_template('community.html')
	else:
		return render_template('index.html')

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
	vital['vital_id'] = 'cholesterol'
	vital['vital_name'] = 'Cholesterol'
	vital['vital_subs'] = ['Total', 'LDL']
	vital['vital_icon_name'] = 'cholesterol-icon.png'
	vital['vital_values'] = [242, 170]
	vital['vital_values_sep'] = '/'
	vital['vital_unit'] = 'mg/dL'
	vital['vital_definitions'] = ['Cholesterol is a lipid (fat) produced by the liver.  Having a high total cholesterol can lead to cardiovascular disease and stroke.  It is recommended to have a total cholesterol level below 200 mg/dL.', 'LDL cholesterol collects in the walls of blood vessels, causing the blockages of atherosclerosis. Higher LDL cholesterol levels put you at greater risk for a heart attack from a sudden blood clot in an artery narrowed by atherosclerosis']
	vital['vital_recommendation'] = 'Your cholesterol is unhealthy.  You need to eat more vegetables and less fatty foods.  Try to spend at least 3 days every week with this new diet.  Please follow our recommendation and come back to the clinic in 2 months and 11 days.'

 	vitals.append(vital)

	vital = {}
	vital['vital_id'] = 'bmi'
	vital['vital_name'] = 'Body Mass Index (BMI)'
	vital['vital_subs'] = ['']
	vital['vital_icon_name'] = 'bmi-icon.png'
	vital['vital_values'] = [27] #[21.26]
	vital['vital_values_sep'] = ''
	vital['vital_unit'] = 'kg/m&#178;'
	vital['vital_definitions'] = ['BMI, or body mass index, is a calculation used to find out if a person is underweight, normal weight, overweight, or obese.  Having a high BMI can indicate that you are obese.  It is recommended to have a BMI below 25 kg/m&#178;.']
	vital['vital_recommendation'] = 'Your BMI is unhealthy.  You need to eat more vegetables and less fatty foods.  Try to spend at least 3 days every week with this new diet.  Please follow our recommendation and come back to the clinic in 2 months and 11 days.'

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
	vital['vital_definitions'] = ['Systolic blood pressure measures the amount of pressure that blood exerts on arteries and vessels while the heart is beating.  High systolic blood pressure, or hypertension, increases the risk of heart disease and stroke. Hypertension risk factors include obesity, drinking too much alcohol, smoking, and family history. It is recommended to have a systolic blood pressure below 120 mmHg.', 'Diastolic blood pressure is the pressure that is exerted on the walls of the various arteries around the body in between heart beats when the heart is relaxed. High systolic blood pressure, or hypertension, increases the risk of heart disease and stroke. Hypertension risk factors include obesity, drinking too much alcohol, smoking, and family history.  It is recommended to have a diastolic blood pressure below 80 mmHg.']
	vital['vital_recommendation'] = 'Your blood pressure is healthy!  You are eating foods with an appropriate level of salt.'
 	vitals.append(vital)

	context = {}
	context['vitals'] = vitals
 	return context

app.secret_key = '*\xd6\xe8T\xd7\xdc9\xcb\xbb\x9e/\xc1\xf5\xbas\x94s\xb6,\xbaB\xfcS!'

if __name__ == '__main__':
	port = int(os.environ.get("PORT", 5000))
	app.debug = True
	app.run(host='0.0.0.0', port=port)