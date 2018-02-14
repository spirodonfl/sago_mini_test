angular.module('myApp', [])
    .controller('MainController', function ($scope, $http) {
        $scope.bundle_id = '';
        $scope.build_number = '';
        $scope.searchBundle = function () {
            var valid = true;
            if ($scope.bundle_id === '') {
                $scope.message = 'Please enter a bundle name';
                valid = false;
            }

            if (valid) {
                $http.get('/api/read?bundle_id=' + $scope.bundle_id)
                    .then(function (response) {
                        if (response.status === 200) {
                            $scope.message = 'Bundle found!';
                        } else {
                            $scope.message = 'Unknown error';
                        }
                    })
                    .catch(function (response) {
                        if (response.status === 403) {
                            $scope.message = 'Bundle not found!';
                        } else {
                            $scope.message = 'Unknown error';
                        }
                    });
            }
        }
        $scope.bumpBundle = function () {
            var valid = true;
            if ($scope.bundle_id === '') {
                $scope.message = 'Please enter a bundle name';
                valid = false;
            }

            if (valid) {
                $http.post('/api/bump', {bundle_id: $scope.bundle_id})
                    .then(function (response) {
                        if (response.status === 200) {
                            if (response.data.message === 'Bundle created') {
                                $scope.message = 'New bundle created and build number is set to ' + response.data.data.build_number;
                            } else {
                                $scope.message = 'Bundle build number now set to ' + response.data.data.build_number;
                            }
                        } else {
                            $scope.message = 'Unknown error';
                        }
                    })
                    .catch(function (response) {
                        if (response.status === 403) {
                            $scope.message = 'Bundle not found!';
                        } else {
                            $scope.message = 'Unknown error';
                        }
                    });
            }
        }
        $scope.setBundle = function () {
            var valid = true;
            if ($scope.bundle_id === '') {
                $scope.message = 'Please enter a bundle name';
                valid = false;
            }

            if (valid) {
                $http.post('/api/set', {bundle_id: $scope.bundle_id, new_build_number: $scope.build_number})
                    .then(function (response) {
                        if (response.status === 200) {
                            if (response.data.message === 'Bundle created') {
                                $scope.message = 'New bundle created and build number is set to ' + response.data.data.build_number;
                            } else {
                                $scope.message = 'Bundle build number now set to ' + response.data.data.build_number;
                            }
                        } else {
                            $scope.message = 'Unknown error';
                        }
                    })
                    .catch(function (response) {
                        if (response.status === 403) {
                            $scope.message = 'Bundle not found!';
                        } else if (response.status === 400) {
                            $scope.message = response.data.message;
                        } else {
                            $scope.message = 'Unknown error';
                        }
                    });
            }
        }
    });
