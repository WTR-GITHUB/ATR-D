#!/bin/bash
# /home/master/DIENYNAS/scripts/fix_sequences_docker.sh
# Docker komanda PostgreSQL sekų atnaujinimui
# Naudoja Django backend container'į

echo "🚀 A-DIENYNAS PostgreSQL sekų atnaujinimas per Docker"
echo "=================================================="

# Tikrina ar Docker container'is veikia
echo "🔍 Tikrinamas backend container'io statusas..."
if ! docker compose ps backend | grep -q "Up"; then
    echo "❌ Backend container'is neveikia!"
    echo "Paleiskite: docker compose up -d"
    exit 1
fi

echo "✅ Backend container'is veikia"

# Paleidžia sekų atnaujinimą per Docker
echo "🔧 Paleidžiamas sekų atnaujinimas..."
docker compose exec backend python /home/master/DIENYNAS/scripts/fix_sequences.py

echo "✅ Sekų atnaujinimas baigtas!"
echo ""
echo "💡 Norėdami tikrinti sekų statusą be keitimo:"
echo "   docker compose exec backend python /home/master/DIENYNAS/scripts/fix_sequences.py --check"
