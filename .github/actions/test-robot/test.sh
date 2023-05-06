npx wrangler pages dev . --local --persist &
pid=$!

sleep 5
robot --outputdir tests/robot/results tests/robot/greyboard.robot
result=$?
kill $pid
exit $result
