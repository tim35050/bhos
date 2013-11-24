import requests
import simplejson as json

class RequestsIPS:

	operatePostURL = "http://ipensook.com:8888/iphr3/rest/rsservice/dataOperatePost"
	resultPostURL = "http://ipensook.com:8888/iphr3/rest/rsservice/dataResultPost"
	careID = 0

	def __init__(self):
		pass

	def add_new_user(self, email, password):
		headers = self.get_post_headers()
		addDate = {"year":2013,"month":10,"dayOfMonth":20,"hourOfDay":15,"minute":18,"second":30}
		params = 'json=' + json.dumps(self.get_add_new_user_json(email, password, addDate))
		return self.post(self.operatePostURL, params, headers)
		
	def login(self, email, password):
		headers = self.get_post_headers()
		addDate = {"year":2012,"month":8,"dayOfMonth":14,"hourOfDay":9,"minute":34,"second":21}
		params = 'json=' + json.dumps(self.get_login_json(email, password, addDate))
		return self.post(self.resultPostURL, params, headers)

	def add_data(self, careId, key, value, date):
		headers = self.get_post_headers()
		params = 'json=' + json.dumps(self.get_add_data_json(careId, key, value, date))
		return self.post(self.operatePostURL, params, headers)

	def get_data(self, careId, key):
		headers = self.get_post_headers()
		date = {"year":2012,"month":8,"dayOfMonth":14,"hourOfDay":9,"minute":34,"second":21}
		params = 'json=' + json.dumps(self.get_get_data_json(careId, key, date))
		return self.post(self.resultPostURL, params, headers)

	@staticmethod
	def get_post_headers():
		return {'Content-Type': 'application/json', 'charset': 'UTF-8'}

	@staticmethod
	def post(url, params, headers):
		try:
			r = requests.post(url, data=params, headers=headers)
			return r
		except requests.exceptions.RequestException:
			print "fail"
			raise
		else:
			pass
		finally:
			pass
		return None

	@staticmethod
	def get_add_new_user_json(email, password, addDate):
		return {"appId":"Ap7sCHAn6l","data":{"key":"AtINLbDA1e","childs":[{"key":"PtHZemv9v3","value":email,"childs":[]},{"key":"PtxdLh4OIm","value":password,"childs":[]},{"key":"PtzucTQTIZ","value":"1","childs":[]}]},"dateTime":addDate,"latitude":"100","longitude":"101"}

	@staticmethod
	def get_login_json(email, password, addDate):
		return {"appId":"Ap7sCHAn6l","data":{"key":"AtnSUhAT1P","name":email,"value":password,"childs":[]},"dateTime":addDate,"latitude":"","longitude":""}

	@staticmethod
	def get_add_data_json(careId, key, value, addDate):
		return {"appId":"Ap7sCHAn6l","careId":careId,"data":{"key":key,"name":"","value":value,"childs":[]},"dateTime":addDate,"latitude":"","longitude":""}

	@staticmethod
	def get_get_data_json(careId, key, date):
		return {"appId":"Ap7sCHAn6l","careId":careId,"data":{"key":key,"name":"","value":"","childs":[]},"dateTime":date,"latitude":"","longitude":""}





