import pymysql

# This makes pymysql work as a drop-in replacement for mysqlclient
pymysql.install_as_MySQLdb()
