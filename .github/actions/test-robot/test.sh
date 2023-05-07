npx wrangler pages dev dist --local --persist &
pid=$!

sleep 5
robot --outputdir tests/robot/results tests/robot/basics.robot tests/robot/board_management.robot
result=$?
kill $pid
exit $result
