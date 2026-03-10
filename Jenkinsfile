pipeline {
    agent any
    
    tools {
	nodejs 'NodeJS'
    }
    
    stages {
	
	stage('build') {
	    steps {
		echo 'Building frontend app'
		sh 'NODE_OPTIONS=--dns-result-order=ipv4first npm install'
		sleep 4
	    }
	}

	stage('test') {
	    steps {
		echo 'this is the test job'
		sh '''
                NODE_OPTIONS=--dns-result-order=ipv4first npm install
                NODE_OPTIONS=--dns-result-order=ipv4first npm test
                '''
		sleep 9
	    }
	}

	stage('package') {
	    steps {
		echo 'this is the package job'
		sh 'NODE_OPTIONS=--dns-result-order=ipv4first npm run package'
		sleep 7
		archiveArtifacts '**/distribution/*.zip'
	    }
	}

    }
    
    post {
	always {
	    echo 'this pipeline has completed...'
	}

    }
}
