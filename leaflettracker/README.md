# leaflettracker

When in directory:

cp * ../goatchurchprime.github.io/leaflettracker  (we don't want the subdirectories copied anyway)
then commit and push from there

# getting new area

Go to openstreetmap.org and zoom in to the area, click on Export, then manually select the area you want.

Then run osmdata_parsing notebook to read and write the file to select out the 
roads and output into a json file.

Make sure the json file is referenced in the example.html
