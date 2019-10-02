#!/bin/bash
rm heart*_s.png
for i in heart*.png;
do
    convert $i -resize 150x150 $(basename $i .png)_s.png;
done
