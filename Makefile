processing/EJSCREEN_2020_USPR.mbtiles: processing/EJSCREEN_2020_USPR.geojsonl
	cd processing && tippecanoe -ab -aN -o ej-2.mbtiles -f -n ejscreen \
		-y CANCER \
		-T CANCER:int \
		-P \
		-f \
		-Z 4 -z 10 \
		EJSCREEN_2020_USPR.geojsonl

processing/EJSCREEN_2020_USPR.geojsonl: processing/EJSCREEN_2020_USPR.gdb
	cd processing && ogr2ogr -f GeoJSONSeq EJSCREEN_2020_USPR.geojsonl EJSCREEN_2020_USPR.gdb EJSCREEN_Full

processing/EJSCREEN_2020_USPR.gdb:
	wget https://gaftp.epa.gov/EJSCREEN/2020/EJSCREEN_2020_USPR.gdb.zip -O processing/EJSCREEN_2020_USPR.gdb.zip --no-check-certificate
	cd processing && unzip EJSCREEN_2020_USPR.gdb.zip
