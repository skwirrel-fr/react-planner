#!/bin/bash

if [ -z "$NPM_TOKEN" ]
  then
    echo "Please source up an NPM_TOKEN"
    exit 1;
fi

appname=react-planner;
tag=$1;
autopush=$2;
autodeploy=$3;

if [ -z "$tag" ]
  then
    echo "No tag name specified. HINT: Use build number or wipx"
    exit 1
fi

if [ -z "$NPM_TOKEN" ]
  then
    echo "NPM_TOKEN is undefined."
    exit 1
fi

if [ "$(uname)" == "Darwin" ]; then
   docker=docker
else
   docker=sudo docker
fi

echo "Building docker image for $appname:$tag";

$docker build . --tag dockerhub-staging.skwirrel.fr/$appname:$tag --build-arg NPM_TOKEN=$NPM_TOKEN

if [ -z "$2" ]
  then
    read -p "Push to docker hub? [y/n] " -n 1 -r
    echo # move to a new line
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        $docker push dockerhub-staging.skwirrel.fr/$appname:$tag
    else
        exit 0;
    fi
else
  $docker push dockerhub-staging.skwirrel.fr/$appname:$tag
fi

if [ -z "$2" ]
  then
    read -p "Deploy docker image? [y/n] " -n 1 -r
    echo # move to a new line

    if [ -z "$KUBECONFIG" ]
      then
        echo "Please configure the KUBECONFIG variable"
        exit 1;
    fi

    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        if grep "staging" $KUBECONFIG > /dev/null
        then
           kubectl set image deployment/$appname $appname=dockerhub-staging.skwirrel.fr/$appname:$tag --record
        else
           echo "Not using a staging KUBECONFIG - see ya!"
        fi
    else
        exit 0;
    fi
else
  if grep "staging" $KUBECONFIG > /dev/null
  then
     kubectl set image deployment/$appname $appname=dockerhub-staging.skwirrel.fr/$appname:$tag --record
  else
     echo "Not using a staging KUBECONFIG - see ya!"
  fi
fi
