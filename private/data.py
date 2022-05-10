# This script imports data from MetObjects CSV file into SQLite db.

import sqlite3
import csv
from numpy import object_
import requests

# Start working with CSV data
csvfile = "public/MetObjects.csv"

# Create database
db = sqlite3.connect("public/objects.db")
print("Database opened.")

# Create table & headers
db.execute('''CREATE TABLE OBJECTS(
		ID              INT       PRIMARY KEY       NOT NULL,
		HIGHLIGHT       BOOL,
		GALLERY         INT,
		DEPT            TEXT,

		BEGIN           INT,
		END             INT,

		CULTURE         TEXT,
		PERIOD          TEXT,
		DYNASTY         TEXT,
		REIGN           TEXT,
		ARTIST          TEXT,
		NATIONALITY     TEXT,

		TAGS            TEXT,
		IMAGE			TEXT
	);''')
print("Table created successfully.")

# Reading csv file
with open(csvfile, 'r') as csvdata:
	# Create a csv reader object
	csvreader = csv.reader(csvdata)
	next(csvreader)
	# Collect information per row
	counter = 0
	for row in csvreader:
		# # Data skipping if necessary
		# if counter < 200189:
		# 	counter += 1
		# 	continue
		# See if object has image
		object_id = row[4]
		response = requests.get("https://collectionapi.metmuseum.org/public/collection/v1/objects/" + object_id)
		try:
			response.json()['primaryImage']
		except:
			print("\nItem does not exist: " + str(counter))
			counter += 1
			continue
		if response.json()['primaryImage']:
			db.execute("INSERT into OBJECTS (ID, HIGHLIGHT, GALLERY, DEPT, BEGIN, END, CULTURE, PERIOD, DYNASTY, REIGN, ARTIST, NATIONALITY, TAGS, IMAGE) \
					values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", (row[4], row[1], row[5], row[6], row[29], row[30], row[10], row[11], row[12], row[13], row[18], row[22], row[51], response.json()['primaryImage']))
			print(counter, end=" ")
		# print(row[4], row[1], row[5], row[6], row[29], row[30], row[10], row[11], row[12], row[13], row[18], row[22], row[51], response.json()['primaryImage'])
		else:
			print("\nDeleted item " + str(counter) + ": " + str(row[4]))
		db.commit()
		counter += 1

# Close db
db.close()