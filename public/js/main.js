angular.module('myApp', [])
    .controller('MainController', function ($scope, $http) {
        $scope.bundle_id = '';
        $scope.build_number = '';
        $scope.message = {
            danger: '', information: '', success: ''
        };
        function resetMessages() {
            $scope.message.danger = '';
            $scope.message.information = '';
            $scope.message.success = '';
        }
        $scope.searchBundle = function () {
            resetMessages();
            var valid = true;
            if ($scope.bundle_id === '') {
                $scope.message.danger = 'Please enter a bundle name';
                valid = false;
            } else if (!$scope.bundle_id.match(/\w+(?:\.\w+){2,}/)) {
                $scope.message.danger = 'Please enter a valid bundle. Example: com.sagomini.HomeworkChallenge';
                valid = false;
            }

            if (valid) {
                $http.get('/api/read?bundle_id=' + $scope.bundle_id)
                    .then(function (response) {
                        if (response.status === 200) {
                            $scope.message.success = 'Bundle found! Build number is ' + response.data.bundle.build_number;
                        } else {
                            $scope.message.danger = 'Unknown error';
                        }
                    })
                    .catch(function (response) {
                        if (response.status === 403) {
                            $scope.message.danger = 'Bundle not found!';
                        } else if (response.status === 400) {
                            $scope.message.danger = response.data.message;
                        } else {
                            $scope.message.danger = 'Unknown error';
                        }
                    });
            }
        }
        $scope.bumpBundle = function () {
            resetMessages();
            var valid = true;
            if ($scope.bundle_id === '') {
                $scope.message.danger = 'Please enter a bundle name';
                valid = false;
            } else if (!$scope.bundle_id.match(/\w+(?:\.\w+){2,}/)) {
                $scope.message.danger = 'Please enter a valid bundle. Example: com.sagomini.HomeworkChallenge';
                valid = false;
            }

            if (valid) {
                $http.post('/api/bump', {bundle_id: $scope.bundle_id})
                    .then(function (response) {
                        if (response.status === 200) {
                            if (response.data.message === 'Bundle created') {
                                $scope.message.success = 'New bundle created and build number is set to ' + response.data.bundle.build_number;
                            } else {
                                $scope.message.success = 'Bundle build number now set to ' + response.data.bundle.build_number;
                            }
                        } else {
                            $scope.message.danger = 'Unknown error';
                        }
                    })
                    .catch(function (response) {
                        if (response.status === 403) {
                            $scope.message.danger = 'Bundle not found!';
                        } else if (response.status === 400) {
                            $scope.message.danger = response.data.message;
                        } else {
                            $scope.message.danger = 'Unknown error';
                        }
                    });
            }
        }
        $scope.setBundle = function () {
            resetMessages();
            var valid = true;
            if ($scope.bundle_id === '') {
                $scope.message.danger = 'Please enter a bundle name';
                valid = false;
            } else if (!$scope.bundle_id.match(/\w+(?:\.\w+){2,}/)) {
                $scope.message.danger = 'Please enter a valid bundle. Example: com.sagomini.HomeworkChallenge';
                valid = false;
            } else if ($scope.build_number === '') {
                $scope.message.danger = 'Please enter a build number';
                valid = false;
            } else if (isNaN(Number($scope.build_number))) {
                $scope.message.danger = 'Please enter a build number as an integer';
                valid = false;
            }

            if (valid) {
                $http.post('/api/set', {bundle_id: $scope.bundle_id, new_build_number: $scope.build_number})
                    .then(function (response) {
                        if (response.status === 200) {
                            if (response.data.message === 'Bundle created') {
                                $scope.message.success = 'New bundle created and build number is set to ' + response.data.bundle.build_number;
                            } else {
                                $scope.message.success = 'Bundle build number now set to ' + response.data.bundle.build_number;
                            }
                        } else {
                            $scope.message.danger = 'Unknown error';
                        }
                    })
                    .catch(function (response) {
                        if (response.status === 403) {
                            $scope.message.danger = 'Bundle not found!';
                        } else if (response.status === 400) {
                            $scope.message.danger = response.data.message;
                        } else {
                            $scope.message.danger = 'Unknown error';
                        }
                    });
            }
        }
    });
