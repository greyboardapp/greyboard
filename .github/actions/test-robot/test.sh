npx wrangler pages dev dist --local --persist &
pid=$!

sleep 5
robot --outputdir tests/robot/results tests/robot/greyboard.robot
kill $pid
